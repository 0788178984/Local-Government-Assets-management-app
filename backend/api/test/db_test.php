<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    include_once '../config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as team_count FROM maintenance_teams");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Database connection successful",
        "team_count" => $result['team_count']
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 