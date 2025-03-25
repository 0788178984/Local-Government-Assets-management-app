<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include database configuration
require_once '../config/database.php';

try {
    $database = new Database();
    
    // First check if database exists
    $dbExists = $database->databaseExists();
    if (!$dbExists) {
        throw new Exception("Database 'local_govt_assets' does not exist");
    }
    
    // Try to connect
    $conn = $database->getConnection();
    
    // Test required tables
    $tables = ['assets', 'maintenance_records', 'maintenance_teams', 'reports', 'users'];
    $missingTables = [];
    
    foreach ($tables as $table) {
        $stmt = $conn->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() == 0) {
            $missingTables[] = $table;
        }
    }
    
    echo json_encode([
        "status" => "success",
        "message" => "Database connection successful",
        "details" => [
            "database_exists" => $dbExists,
            "database_name" => "local_govt_assets",
            "connection_status" => "Connected",
            "missing_tables" => $missingTables,
            "php_version" => PHP_VERSION,
            "mysql_version" => $conn->getAttribute(PDO::ATTR_SERVER_VERSION),
            "mysql_host" => $database->host
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "type" => get_class($e)
    ]);
}
?> 