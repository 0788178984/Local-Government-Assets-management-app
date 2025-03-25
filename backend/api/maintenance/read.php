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
                m.TeamID,
                t.TeamName,
                m.MaintenanceDate,
                m.Description,
                m.Status,
                m.Priority,
                m.CompletionDate,
                m.Cost
              FROM maintenance_records m
              LEFT JOIN assets a ON m.AssetID = a.AssetID
              LEFT JOIN maintenance_teams t ON m.TeamID = t.TeamID
              ORDER BY m.MaintenanceDate DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $records = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $record = array(
            "MaintenanceID" => $row['MaintenanceID'],
            "AssetID" => $row['AssetID'],
            "AssetName" => $row['AssetName'],
            "TeamID" => $row['TeamID'],
            "TeamName" => $row['TeamName'],
            "MaintenanceDate" => $row['MaintenanceDate'],
            "Description" => $row['Description'],
            "Status" => $row['Status'],
            "Priority" => $row['Priority'],
            "CompletionDate" => $row['CompletionDate'],
            "Cost" => $row['Cost']
        );
        array_push($records, $record);
    }

    if (count($records) > 0) {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Maintenance records retrieved successfully",
            "data" => $records
        ));
    } else {
        http_response_code(200);  // Changed from 404 to 200 to handle empty results better
        echo json_encode(array(
            "status" => "success",
            "message" => "No maintenance records found",
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