<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 1); // Display errors for this test script
ini_set('log_errors', 1);

// Include necessary files
require_once 'config/database.php';
require_once 'config/core.php';
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

    // Initialize user object
    $user = new User($conn);
    
    // Test credentials
    $credentials = [
        'username' => 'admin@localgov.com',
        'password' => 'password'
    ];
    
    // Set username to test
    $user->Username = $credentials['username'];
    
    // Check if user exists
    $stmt = $user->getUserByUsername();
    
    if (!$stmt || $stmt->rowCount() == 0) {
        sendResponse("error", "User not found", [
            'details' => "Username {$credentials['username']} does not exist in the database",
            'test_credentials' => $credentials
        ]);
    }
    
    // Get user data
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check password
    $passwordCorrect = false;
    $passwordMessage = "Password verification failed";
    
    if (isset($row['Password'])) {
        // For display purposes, don't show full hash
        $displayHash = substr($row['Password'], 0, 20) . '...';
        
        // Verify password
        $passwordCorrect = password_verify($credentials['password'], $row['Password']);
        $passwordMessage = $passwordCorrect ? "Password verified successfully" : "Password verification failed";
    } else {
        $passwordMessage = "Password field not found in user record";
    }
    
    // Sanitize user data for display (don't show full password)
    $userDataForDisplay = $row;
    if (isset($userDataForDisplay['Password'])) {
        $userDataForDisplay['Password'] = substr($userDataForDisplay['Password'], 0, 20) . '...';
    }
    
    // Generate tokens
    $token = bin2hex(random_bytes(16));
    $refreshToken = bin2hex(random_bytes(32));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $refreshTokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));
    
    // Try to update tokens
    $tokenUpdateSuccess = false;
    $lastLoginUpdateSuccess = false;
    
    if ($passwordCorrect) {
        $tokenUpdateSuccess = $user->updateTokens($row['UserID'], $token, $refreshToken, $tokenExpiry, $refreshTokenExpiry);
        $lastLoginUpdateSuccess = $user->updateLastLoginById($row['UserID']);
    }
    
    sendResponse($passwordCorrect ? "success" : "error", 
        $passwordCorrect ? "Login successful" : "Login failed", 
        [
            'user_found' => true,
            'user_data' => $userDataForDisplay,
            'password_check' => [
                'result' => $passwordCorrect,
                'message' => $passwordMessage
            ],
            'token_update' => [
                'success' => $tokenUpdateSuccess,
                'token' => $passwordCorrect ? $token : null,
                'token_expiry' => $passwordCorrect ? $tokenExpiry : null
            ],
            'last_login_update' => $lastLoginUpdateSuccess,
            'test_credentials' => $credentials
        ]
    );
    
} catch (Exception $e) {
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
