<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $query = "DESCRIBE Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tableStructure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get all users (excluding password for security)
    $query = "SELECT UserID, Username, Email, UserRole, CreatedAt, LastLogin, IsActive, AuthProvider FROM Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "status" => "success",
        "message" => "Users data",
        "table_structure" => $tableStructure,
        "users" => $users
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
