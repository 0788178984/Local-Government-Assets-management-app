<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get table structure
    $query = "DESCRIBE maintenancerecords";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get sample data
    $dataQuery = "SELECT * FROM maintenancerecords LIMIT 1";
    $dataStmt = $db->prepare($dataQuery);
    $dataStmt->execute();
    $sampleData = $dataStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "status" => "success",
        "table_structure" => $columns,
        "sample_data" => $sampleData
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
