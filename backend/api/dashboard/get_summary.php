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

    // Get total assets count
    $assetQuery = "SELECT COUNT(*) as totalAssets FROM assets";
    $assetStmt = $db->prepare($assetQuery);
    $assetStmt->execute();
    $assetData = $assetStmt->fetch(PDO::FETCH_ASSOC);

    // Get maintenance counts by status
    $maintenanceQuery = "SELECT 
        COUNT(*) as maintenanceCount,
        SUM(CASE WHEN TRIM(MaintenanceStatus) = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN TRIM(MaintenanceStatus) = 'In Progress' THEN 1 ELSE 0 END) as inProgressCount,
        SUM(CASE WHEN TRIM(MaintenanceStatus) = 'Completed' THEN 1 ELSE 0 END) as completedCount
    FROM maintenancerecords";
    
    $maintenanceStmt = $db->prepare($maintenanceQuery);
    $maintenanceStmt->execute();
    $maintenanceData = $maintenanceStmt->fetch(PDO::FETCH_ASSOC);

    // Get teams data
    $teamsQuery = "SELECT 
        COUNT(TeamID) as totalTeams,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as activeTeams
    FROM maintenanceteams";
    $teamsStmt = $db->prepare($teamsQuery);
    $teamsStmt->execute();
    $teamsData = $teamsStmt->fetch(PDO::FETCH_ASSOC);

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
        MaintenanceDate as date,
        CONCAT('Maintenance: ', MaintenanceStatus) as action
    FROM maintenancerecords 
    ORDER BY MaintenanceDate DESC 
    LIMIT 5)
    ORDER BY date DESC
    LIMIT 5";
    
    $recentStmt = $db->prepare($recentQuery);
    $recentStmt->execute();
    $recentActivities = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug maintenance counts
    error_log("Maintenance counts: " . print_r($maintenanceData, true));

    // Combine all data
    $summaryData = array_merge(
        $assetData,
        [
            'maintenanceCount' => (int)$maintenanceData['maintenanceCount'],
            'maintenanceStatus' => [
                'pending' => (int)$maintenanceData['pendingCount'],
                'inProgress' => (int)$maintenanceData['inProgressCount'],
                'completed' => (int)$maintenanceData['completedCount']
            ]
        ],
        ['reportCount' => (int)$maintenanceData['maintenanceCount']],
        ['teams' => [
            'total' => (int)$teamsData['totalTeams'],
            'active' => (int)$teamsData['activeTeams']
        ]],
        ['recentActivities' => $recentActivities]
    );

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