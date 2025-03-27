<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT UserID, Username, Email, UserRole, CreatedAt, LastLogin, IsActive 
             FROM Users ORDER BY CreatedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Sanitize the output to remove sensitive data
        foreach ($users as &$user) {
            unset($user['Password']);
        }
        
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Users retrieved successfully",
            "data" => $users
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No users found"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?> 