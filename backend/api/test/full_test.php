<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Test database connection
    include_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    // Test read operation
    $stmt = $db->query("SELECT * FROM maintenance_teams LIMIT 1");
    $team = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Test write operation
    $testTeam = [
        'TeamName' => 'Test Team',
        'TeamLeader' => 'Test Leader',
        'ContactPhone' => '000-000-0000',
        'ContactEmail' => 'test@example.com'
    ];
    
    $insertStmt = $db->prepare("INSERT INTO maintenance_teams 
        (TeamName, TeamLeader, ContactPhone, ContactEmail) 
        VALUES (:name, :leader, :phone, :email)");
    $insertStmt->execute($testTeam);
    $testId = $db->lastInsertId();
    
    // Clean up
    $deleteStmt = $db->prepare("DELETE FROM maintenance_teams WHERE TeamID = ?");
    $deleteStmt->execute([$testId]);
    
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "All tests passed successfully",
        "sample_team" => $team
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 