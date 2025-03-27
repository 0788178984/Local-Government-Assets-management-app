<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get the AssetID from the request
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->AssetID)) {
    try {
        // First check if the asset has any maintenance records
        $checkQuery = "SELECT COUNT(*) as count FROM MaintenanceRecords WHERE AssetID = :assetId";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":assetId", $data->AssetID);
        $checkStmt->execute();
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if($row['count'] > 0) {
            // If asset has maintenance records, just mark it as inactive
            $query = "UPDATE Assets SET IsActive = 0 WHERE AssetID = :assetId";
        } else {
            // If no maintenance records, we can delete it completely
            $query = "DELETE FROM Assets WHERE AssetID = :assetId";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(":assetId", $data->AssetID);

        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Asset deleted successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to delete asset"
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
        "message" => "Unable to delete asset. Asset ID is required."
    ));
}
?> 