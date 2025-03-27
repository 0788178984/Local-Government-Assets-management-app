<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->ReportID)) {
    try {
        $query = "SELECT r.*, u.Username as GeneratedByName 
                  FROM Reports r 
                  LEFT JOIN Users u ON r.GeneratedBy = u.UserID 
                  WHERE r.ReportID = :reportId AND r.IsActive = 1";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(":reportId", $data->ReportID);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format the date
            $row['GeneratedDate'] = date('Y-m-d H:i:s', strtotime($row['GeneratedDate']));
            
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "data" => $row
            ));
        } else {
            http_response_code(404);
            echo json_encode(array(
                "status" => "error",
                "message" => "Report not found."
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
        "message" => "Missing Report ID."
    ));
}
?> 