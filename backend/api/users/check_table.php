<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $query = "DESCRIBE Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tableStructure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "status" => "success",
        "message" => "Users table structure",
        "data" => $tableStructure
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
