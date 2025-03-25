<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Log received data (remove in production)
error_log("Received data: " . print_r($data, true));

if(!empty($data->UserID) && !empty($data->CurrentPassword) && !empty($data->NewPassword)) {
    try {
        // First verify current password
        $query = "SELECT Password FROM Users WHERE UserID = :userId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":userId", $data->UserID);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verify current password
            if(password_verify($data->CurrentPassword, $row['Password'])) {
                // Hash new password
                $newPasswordHash = password_hash($data->NewPassword, PASSWORD_DEFAULT);
                
                // Update password
                $query = "UPDATE Users SET Password = :password WHERE UserID = :userId";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":password", $newPasswordHash);
                $stmt->bindParam(":userId", $data->UserID);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array(
                        "status" => "success",
                        "message" => "Password changed successfully"
                    ));
                } else {
                    http_response_code(503);
                    echo json_encode(array(
                        "status" => "error",
                        "message" => "Unable to update password"
                    ));
                }
            } else {
                http_response_code(400);
                echo json_encode(array(
                    "status" => "error",
                    "message" => "Current password is incorrect"
                ));
            }
        } else {
            http_response_code(404);
            echo json_encode(array(
                "status" => "error",
                "message" => "User not found"
            ));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array(
            "status" => "error",
            "message" => "Database error: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "status" => "error",
        "message" => "Unable to change password. Required data is missing."
    ));
}
?> 