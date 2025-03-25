<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->ReportID)) {
    try {
        $query = "UPDATE Reports SET IsActive = 0 WHERE ReportID = :reportId";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":reportId", $data->ReportID);

        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Report deleted successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to delete report"
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
        "message" => "Unable to delete report. Report ID is required."
    ));
}
?> 