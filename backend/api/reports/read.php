<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Query to get all maintenance records with related information
    $query = "SELECT 
        mr.MaintenanceID,
        COALESCE(a.AssetName, 'Unknown Asset') as AssetName,
        COALESCE(a.AssetType, 'Unspecified') as AssetType,
        mr.MaintenanceDate,
        COALESCE(mr.MaintenanceType, 'Not Specified') as MaintenanceType,
        COALESCE(mr.Description, '') as Description,
        COALESCE(mr.Cost, 0) as Cost,
        COALESCE(mr.MaintenanceStatus, 'Pending') as MaintenanceStatus,
        COALESCE(t.TeamName, 'Unassigned') as TeamName,
        COALESCE(t.TeamLeader, 'Not Specified') as TeamLeader
    FROM MaintenanceRecords mr
    LEFT JOIN Assets a ON mr.AssetID = a.AssetID
    LEFT JOIN MaintenanceTeams t ON mr.TeamID = t.TeamID
    ORDER BY mr.MaintenanceDate DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    // Get record counts with COALESCE to handle NULLs
    $countQuery = "SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN MaintenanceStatus = 'Pending' THEN 1 ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN MaintenanceStatus = 'In Progress' THEN 1 ELSE 0 END), 0) as in_progress,
        COALESCE(SUM(CASE WHEN MaintenanceStatus = 'Completed' THEN 1 ELSE 0 END), 0) as completed
    FROM MaintenanceRecords";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);

    // Calculate total cost with COALESCE
    $costQuery = "SELECT COALESCE(SUM(Cost), 0) as total_cost FROM MaintenanceRecords";
    $costStmt = $db->prepare($costQuery);
    $costStmt->execute();
    $costResult = $costStmt->fetch(PDO::FETCH_ASSOC);

    $reports = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $report = array(
            "id" => $row['MaintenanceID'],
            "assetName" => trim($row['AssetName']),
            "assetType" => trim($row['AssetType']),
            "maintenanceDate" => $row['MaintenanceDate'],
            "maintenanceType" => trim($row['MaintenanceType']),
            "description" => trim($row['Description']),
            "cost" => number_format((float)$row['Cost'], 2, '.', ''),
            "status" => trim($row['MaintenanceStatus']),
            "teamName" => trim($row['TeamName']),
            "teamLeader" => trim($row['TeamLeader'])
        );
        array_push($reports, $report);
    }

    // Prepare summary data
    $summary = array(
        "total_records" => (string)$counts['total'],
        "pending" => (string)$counts['pending'],
        "in_progress" => (string)$counts['in_progress'],
        "completed" => (string)$counts['completed'],
        "total_cost" => number_format((float)$costResult['total_cost'], 2, '.', '')
    );

    // Return success response
    http_response_code(200);
    echo json_encode(array(
        "status" => "success",
        "message" => "Reports retrieved successfully",
        "data" => $reports,
        "summary" => $summary
    ));

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error occurred"
    ));
} catch (Exception $e) {
    error_log("Server error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "An unexpected error occurred"
    ));
}
?> 