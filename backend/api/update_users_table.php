<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database configuration
require_once 'config/database.php';

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
    exit();
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Check if columns already exist
    $stmt = $conn->prepare("SHOW COLUMNS FROM users LIKE 'Token'");
    $stmt->execute();
    $tokenColumnExists = $stmt->rowCount() > 0;
    
    if (!$tokenColumnExists) {
        // Add Token column
        $stmt = $conn->prepare("ALTER TABLE users ADD Token VARCHAR(255) NULL");
        if (!$stmt->execute()) {
            throw new Exception("Failed to add Token column");
        }
        
        // Add RefreshToken column
        $stmt = $conn->prepare("ALTER TABLE users ADD RefreshToken VARCHAR(255) NULL");
        if (!$stmt->execute()) {
            throw new Exception("Failed to add RefreshToken column");
        }
        
        // Add TokenExpiry column
        $stmt = $conn->prepare("ALTER TABLE users ADD TokenExpiry DATETIME NULL");
        if (!$stmt->execute()) {
            throw new Exception("Failed to add TokenExpiry column");
        }
        
        // Add RefreshTokenExpiry column
        $stmt = $conn->prepare("ALTER TABLE users ADD RefreshTokenExpiry DATETIME NULL");
        if (!$stmt->execute()) {
            throw new Exception("Failed to add RefreshTokenExpiry column");
        }
        
        sendResponse("success", "Token columns added to users table", [
            "added_columns" => ["Token", "RefreshToken", "TokenExpiry", "RefreshTokenExpiry"]
        ]);
    } else {
        sendResponse("info", "Token columns already exist in users table");
    }
    
} catch (Exception $e) {
    error_log("Update users table error: " . $e->getMessage());
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
