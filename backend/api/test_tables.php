<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Check maintenance_records table
    $query = "SELECT COUNT(*) as count FROM maintenance_records";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $maintenance_count = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if schedules table exists
    $query = "SHOW TABLES LIKE 'maintenance_schedules'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $schedules_exists = ($stmt->rowCount() > 0);
    
    // Show all tables
    $query = "SHOW TABLES";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        "status" => "success",
        "maintenance_records_count" => $maintenance_count['count'],
        "schedules_table_exists" => $schedules_exists,
        "all_tables" => $tables
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
