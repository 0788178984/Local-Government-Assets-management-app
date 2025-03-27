<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->ReportID) && !empty($data->ReportContent)) {
    try {
        $query = "UPDATE Reports 
                  SET ReportContent = :content,
                      ReportTitle = :title,
                      ReportType = :type
                  WHERE ReportID = :reportId";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":content", $data->ReportContent);
        $stmt->bindParam(":title", $data->ReportTitle);
        $stmt->bindParam(":type", $data->ReportType);
        $stmt->bindParam(":reportId", $data->ReportID);

        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Report updated successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to update report"
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
        "message" => "Unable to update report. Data is incomplete."
    ));
}
?> 