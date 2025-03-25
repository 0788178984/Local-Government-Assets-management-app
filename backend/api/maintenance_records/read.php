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
                m.MaintenanceType,
                m.Description,
                m.MaintenanceStatus,
                m.MaintenanceProvider,
                m.Cost,
                a.MaintenanceStatus as AssetCondition,
                a.Location
              FROM MaintenanceRecords m
              LEFT JOIN Assets a ON m.AssetID = a.AssetID
              LEFT JOIN MaintenanceTeams t ON m.TeamID = t.TeamID
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
            "MaintenanceType" => $row['MaintenanceType'],
            "Description" => $row['Description'],
            "MaintenanceStatus" => $row['MaintenanceStatus'],
            "MaintenanceProvider" => $row['MaintenanceProvider'],
            "Cost" => $row['Cost'],
            "AssetCondition" => $row['AssetCondition'],
            "Location" => $row['Location']
        );
        array_push($records, $record);
    }

    // Get summary counts
    $countQuery = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN MaintenanceStatus = 'Completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN MaintenanceStatus = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN MaintenanceStatus = 'Pending' THEN 1 ELSE 0 END) as pending
                   FROM MaintenanceRecords";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode(array(
        "status" => "success",
        "message" => count($records) > 0 ? "Maintenance records retrieved successfully" : "No maintenance records found",
        "data" => $records,
        "counts" => array(
            "total" => (int)$counts['total'],
            "completed" => (int)$counts['completed'],
            "in_progress" => (int)$counts['in_progress'],
            "pending" => (int)$counts['pending']
        )
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Failed to retrieve maintenance records: " . $e->getMessage()
    ));
}
?> 