<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->ReportTitle) && !empty($data->ReportType)) {
    try {
        $query = "INSERT INTO Reports 
                  SET 
                    ReportTitle = :title,
                    ReportType = :type,
                    ReportContent = :content,
                    GeneratedBy = :userId,
                    IsActive = 1";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":title", $data->ReportTitle);
        $stmt->bindParam(":type", $data->ReportType);
        $stmt->bindParam(":content", $data->ReportContent);
        $stmt->bindParam(":userId", $data->GeneratedBy);

        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array(
                "status" => "success",
                "message" => "Report generated successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to generate report"
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
        "message" => "Unable to generate report. Data is incomplete."
    ));
}
?> 