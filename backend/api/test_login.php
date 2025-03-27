<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 1); // Display errors for this test script
ini_set('log_errors', 1);

// Include database
require_once 'config/database.php';
require_once 'objects/user.php';

// Function to send response
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

    // Check if users table exists and has records
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        throw new Exception("Users table doesn't exist");
    }
    
    // Count users
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $userCount = $row['count'];
    
    // Test credentials
    $email = "admin@localgov.com";
    $password = "password";
    
    // Check if user exists by email
    $stmt = $conn->prepare("SELECT * FROM users WHERE Email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $userExists = false;
    $userData = null;
    
    if ($stmt->rowCount() > 0) {
        $userExists = true;
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Check if user exists by username
    $stmt = $conn->prepare("SELECT * FROM users WHERE Username = :username");
    $stmt->bindParam(':username', $email); // Try using email as username
    $stmt->execute();
    
    $usernameExists = false;
    $usernameData = null;
    
    if ($stmt->rowCount() > 0) {
        $usernameExists = true;
        $usernameData = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Gather table information
    $stmt = $conn->prepare("DESCRIBE users");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // List all users (limit to 5)
    $stmt = $conn->prepare("SELECT * FROM users LIMIT 5");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Sanitize the user data for display (don't show full passwords)
    if (!empty($users)) {
        foreach ($users as &$user) {
            if (isset($user['Password'])) {
                $user['Password'] = substr($user['Password'], 0, 10) . '...';
            }
        }
    }
    
    sendResponse("success", "Login test completed", [
        'database_connected' => ($conn ? true : false),
        'user_count' => $userCount,
        'user_exists_by_email' => $userExists,
        'user_exists_by_username' => $usernameExists,
        'columns' => $columns,
        'users' => $users,
        'test_credentials' => [
            'email' => $email,
            'password' => '********'
        ]
    ]);
    
} catch (Exception $e) {
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
