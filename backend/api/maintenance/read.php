<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Query to get maintenance records with team and asset details
    $query = "SELECT 
                m.MaintenanceID,
                m.AssetID,
                a.AssetName,
                a.Location as AssetLocation,
                a.MaintenanceStatus as AssetCondition,
                m.TeamID,
                t.TeamName,
                m.MaintenanceDate,
                m.MaintenanceType,
                m.Description,
                m.MaintenanceStatus,
                m.MaintenanceProvider,
                m.Cost
              FROM maintenancerecords m
              LEFT JOIN assets a ON m.AssetID = a.AssetID
              LEFT JOIN maintenanceteams t ON m.TeamID = t.TeamID
              ORDER BY m.MaintenanceDate DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    // Get total counts by status
    $countQuery = "SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN MaintenanceStatus = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN MaintenanceStatus = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN MaintenanceStatus = 'Completed' THEN 1 ELSE 0 END) as completed
    FROM maintenancerecords";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    $records = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($records, $row);
    }

    if (count($records) > 0) {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Maintenance records retrieved successfully",
            "counts" => $counts,
            "data" => $records
        ));
    } else {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "No maintenance records found",
            "counts" => [
                "total" => 0,
                "pending" => 0,
                "in_progress" => 0,
                "completed" => 0
            ],
            "data" => []
        ));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Failed to retrieve maintenance records: " . $e->getMessage()
    ));
}
?>