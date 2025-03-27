<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Include database configuration
    $baseDir = dirname(dirname(dirname(__DIR__)));
    $configPath = $baseDir . '/backend/config/database.php';
    require_once $configPath;

    $database = new Database();
    $db = $database->getConnection();
    
    // Test table existence and structure
    $tables = ['assets', 'maintenance_records', 'maintenance_teams', 'reports'];
    $tableInfo = [];
    
    foreach ($tables as $table) {
        $checkQuery = "SHOW TABLES LIKE '$table'";
        $stmt = $db->query($checkQuery);
        $exists = $stmt->rowCount() > 0;
        
        if ($exists) {
            $columnsQuery = "SHOW COLUMNS FROM $table";
            $columnsStmt = $db->query($columnsQuery);
            $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $countQuery = "SELECT COUNT(*) as count FROM $table";
            $countStmt = $db->query($countQuery);
            $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $tableInfo[$table] = [
                'exists' => true,
                'columns' => $columns,
                'record_count' => $count
            ];
        } else {
            $tableInfo[$table] = [
                'exists' => false,
                'error' => 'Table does not exist'
            ];
        }
    }
    
    // Test summary endpoint
    $ch = curl_init("http://" . $_SERVER['HTTP_HOST'] . "/LocalGovtAssetMgt_App/backend/api/dashboard/get_summary.php");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json']
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo json_encode([
        "status" => "test_complete",
        "table_information" => $tableInfo,
        "summary_test" => [
            "http_code" => $httpCode,
            "response" => json_decode($response, true)
        ],
        "instructions" => [
            "1. Check if all required tables exist",
            "2. Verify column names in each table",
            "3. Confirm record counts are correct",
            "4. Test summary endpoint response"
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 