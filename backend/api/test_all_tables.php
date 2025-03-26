<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    $results = [];
    
    // Check all relevant tables
    $tables = ['maintenance_records', 'maintenancerecords', 'reports'];
    
    foreach ($tables as $table) {
        $query = "SELECT COUNT(*) as count FROM $table";
        try {
            $stmt = $db->prepare($query);
            $stmt->execute();
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            $results[$table] = $count['count'];
        } catch (Exception $e) {
            $results[$table] = "Error: " . $e->getMessage();
        }
    }
    
    // Examine reports table structure
    try {
        $query = "DESCRIBE reports";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['reports_structure'] = $columns;
    } catch (Exception $e) {
        $results['reports_structure'] = "Error: " . $e->getMessage();
    }
    
    echo json_encode([
        "status" => "success",
        "table_counts" => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
