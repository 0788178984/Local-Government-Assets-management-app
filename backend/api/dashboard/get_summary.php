<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Include database configuration with correct path
    require_once dirname(__DIR__) . '/../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    // First, let's check the table structure
    $checkTableQuery = "SHOW COLUMNS FROM assets";
    $checkStmt = $db->query($checkTableQuery);
    $columns = $checkStmt->fetchAll(PDO::FETCH_COLUMN);
    
    error_log("Available columns in assets table: " . implode(", ", $columns));

    // Debug: Check maintenance statuses
    $debugQuery = "SELECT AssetName, MaintenanceStatus FROM assets";
    $debugStmt = $db->query($debugQuery);
    $debugResults = $debugStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Asset maintenance statuses: " . print_r($debugResults, true));

    // Query to get summary data with proper column names
    $query = "SELECT 
        COUNT(*) as totalAssets,
        COALESCE(SUM(CASE WHEN TRIM(MaintenanceStatus) = 'Good' THEN 1 ELSE 0 END), 0) as goodCondition,
        COALESCE(SUM(CASE WHEN TRIM(MaintenanceStatus) = 'Fair' THEN 1 ELSE 0 END), 0) as fairCondition,
        COALESCE(SUM(CASE WHEN TRIM(MaintenanceStatus) = 'Poor' THEN 1 ELSE 0 END), 0) as poorCondition
    FROM assets";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $assetData = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get maintenance count
    $maintenanceQuery = "SELECT COUNT(*) as maintenanceCount FROM maintenance_records";
    $maintenanceStmt = $db->prepare($maintenanceQuery);
    $maintenanceStmt->execute();
    $maintenanceData = $maintenanceStmt->fetch(PDO::FETCH_ASSOC);

    // Get report count
    $reportQuery = "SELECT COUNT(*) as reportCount FROM reports";
    $reportStmt = $db->prepare($reportQuery);
    $reportStmt->execute();
    $reportData = $reportStmt->fetch(PDO::FETCH_ASSOC);

    // Get teams data
    $teamsQuery = "SELECT 
        COUNT(TeamID) as totalTeams,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as activeTeams
    FROM MaintenanceTeams";
    $teamsStmt = $db->prepare($teamsQuery);
    $teamsStmt->execute();
    $teamsData = $teamsStmt->fetch(PDO::FETCH_ASSOC);

    // Debug teams data
    error_log("Teams data: " . print_r($teamsData, true));

    // Get recent activities
    $recentQuery = "
    (SELECT 
        'asset' as type,
        AssetName as title,
        CreatedAt as date,
        'Added new asset' as action
    FROM assets 
    ORDER BY CreatedAt DESC 
    LIMIT 5)
    UNION
    (SELECT 
        'maintenance' as type,
        Description as title,
        CreatedAt as date,
        'New maintenance record' as action
    FROM maintenance_records 
    ORDER BY CreatedAt DESC 
    LIMIT 5)
    ORDER BY date DESC
    LIMIT 5";
    
    $recentStmt = $db->prepare($recentQuery);
    $recentStmt->execute();
    $recentActivities = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Combine all data
    $summaryData = array_merge(
        $assetData,
        ['maintenanceCount' => $maintenanceData['maintenanceCount']],
        ['reportCount' => $reportData['reportCount']],
        ['teams' => [
            'total' => (int)$teamsData['totalTeams'],
            'active' => (int)$teamsData['activeTeams']
        ]],
        ['recentActivities' => $recentActivities]
    );

    // Set default values if any data is null
    foreach ($summaryData as $key => $value) {
        if ($value === null) {
            $summaryData[$key] = ($key === 'recentActivities') ? [] : 0;
        }
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => $summaryData
    ]);

} catch (PDOException $e) {
    error_log("Database error in get_summary.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Server error in get_summary.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?> 