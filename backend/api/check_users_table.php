<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get database config
    $baseDir = dirname(dirname(__DIR__));
    $configPath = $baseDir . '/backend/config/database.php';
    require_once $configPath;
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $columnsQuery = "SHOW COLUMNS FROM users";
    $columnsStmt = $db->query($columnsQuery);
    $columns = [];
    while($row = $columnsStmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $row;
    }
    
    // Get sample data (first 5 rows, only showing non-sensitive fields)
    $dataQuery = "SELECT UserID, Username, Email FROM users LIMIT 5";
    $dataStmt = $db->query($dataQuery);
    $sampleData = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM users";
    $countStmt = $db->query($countQuery);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        "status" => "success",
        "table_structure" => $columns,
        "total_users" => $totalCount,
        "sample_data" => $sampleData
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 