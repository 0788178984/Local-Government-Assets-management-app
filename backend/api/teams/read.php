<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Debug information
error_log("Teams API accessed: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database
include_once '../config/database.php';

try {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Test database connection
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Query for teams
    $query = "SELECT 
                TeamID, 
                TeamName, 
                TeamLeader, 
                ContactPhone, 
                ContactEmail, 
                IsActive, 
                CreatedAt
              FROM MaintenanceTeams
              ORDER BY TeamName";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get counts
    $countQuery = "SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as active
                   FROM MaintenanceTeams";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    // Format response
    if ($teams) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $teams,
            "counts" => [
                "active" => (int)$counts['active'],
                "total" => (int)$counts['total']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No teams found"
        ]);
    }
} catch (Exception $e) {
    error_log("Teams API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>