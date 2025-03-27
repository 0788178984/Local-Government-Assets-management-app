<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Include database configuration
require_once 'config/database.php';

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
    
    // Test user credentials
    $testUsers = [
        [
            'username' => 'admin@localgov.com',
            'email' => 'admin@localgov.com',
            'password' => 'password',
            'role' => 'Admin'
        ],
        [
            'username' => 'manager',
            'email' => 'manager@localgov.com',
            'password' => 'password',
            'role' => 'Asset Manager'
        ]
    ];
    
    $results = [];
    
    foreach ($testUsers as $user) {
        // Check if user already exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE Username = :username OR Email = :email");
        $stmt->bindParam(':username', $user['username']);
        $stmt->bindParam(':email', $user['email']);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $results[$user['username']] = "User already exists";
            continue;
        }
        
        // Create hashed password
        $hashedPassword = password_hash($user['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $conn->prepare("
            INSERT INTO users (Username, Email, Password, UserRole, CreatedAt, IsActive) 
            VALUES (:username, :email, :password, :role, NOW(), 1)
        ");
        
        $stmt->bindParam(':username', $user['username']);
        $stmt->bindParam(':email', $user['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':role', $user['role']);
        
        if ($stmt->execute()) {
            $userId = $conn->lastInsertId();
            $results[$user['username']] = "Created successfully with ID: $userId";
        } else {
            $results[$user['username']] = "Failed to create user: " . implode(", ", $stmt->errorInfo());
        }
    }
    
    sendResponse("success", "Test users setup completed", $results);
    
} catch (Exception $e) {
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
