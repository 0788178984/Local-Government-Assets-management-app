<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                AssetID,
                AssetName,
                AssetType,
                Location,
                AcquisitionDate,
                InitialCost,
                CurrentValue,
                MaintenanceStatus,
                LastMaintenanceDate,
                NextMaintenanceDate
              FROM Assets 
              ORDER BY AssetName";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $assets_arr = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($assets_arr, array(
                "AssetID" => $row['AssetID'],
                "AssetName" => $row['AssetName'],
                "AssetType" => $row['AssetType'],
                "Location" => $row['Location'],
                "AcquisitionDate" => $row['AcquisitionDate'],
                "InitialCost" => $row['InitialCost'],
                "CurrentValue" => $row['CurrentValue'],
                "MaintenanceStatus" => $row['MaintenanceStatus'],
                "LastMaintenanceDate" => $row['LastMaintenanceDate'],
                "NextMaintenanceDate" => $row['NextMaintenanceDate']
            ));
        }
        
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Assets found",
            "data" => $assets_arr
        ));
    } else {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "No assets found",
            "data" => []
        ));
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ));
}
?> 