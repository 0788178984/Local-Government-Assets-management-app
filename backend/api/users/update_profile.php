<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->UserID)) {
        $query = "UPDATE Users 
                  SET 
                    Username = :username,
                    Email = :email,
                    FullName = :fullname,
                    PhoneNumber = :phone,
                    Address = :address
                  WHERE UserID = :userid";

        $stmt = $db->prepare($query);

        // Bind values
        $stmt->bindParam(":userid", $data->UserID);
        $stmt->bindParam(":username", $data->Username);
        $stmt->bindParam(":email", $data->Email);
        $stmt->bindParam(":fullname", $data->FullName);
        $stmt->bindParam(":phone", $data->PhoneNumber);
        $stmt->bindParam(":address", $data->Address);

        if ($stmt->execute()) {
            // Fetch updated user data
            $fetchQuery = "SELECT UserID, Username, Email, UserRole as Role, 
                          FullName, PhoneNumber, Address, ProfilePhoto, AuthProvider 
                          FROM Users WHERE UserID = :userid";
            $fetchStmt = $db->prepare($fetchQuery);
            $fetchStmt->bindParam(":userid", $data->UserID);
            $fetchStmt->execute();
            $userData = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Profile updated successfully",
                "data" => $userData
            ]);
        } else {
            throw new Exception("Failed to update profile");
        }
    } else {
        throw new Exception("UserID is required");
    }
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?> 