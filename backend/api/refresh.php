<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/logs/refresh_error.log');

// Include database and required files
require_once 'config/database.php';
require_once 'config/core.php';

// Make sure logs directory exists
if (!file_exists(dirname(__FILE__) . '/logs')) {
    mkdir(dirname(__FILE__) . '/logs', 0777, true);
}

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    http_response_code($status == "error" ? 400 : 200);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
    exit();
}

// Make sure POST data is received
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("error", "Only POST method is allowed");
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['refreshToken']) || empty($data['refreshToken'])) {
        throw new Exception("Refresh token is required");
    }
    
    $refreshToken = $data['refreshToken'];
    
    // First, check which table exists (users or Users)
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    $usersTableExists = $stmt->rowCount() > 0;
    
    $tableName = $usersTableExists ? 'users' : 'Users';
    
    // Find user by refresh token
    $stmt = $conn->prepare("SELECT * FROM $tableName WHERE RefreshToken = :refresh_token AND RefreshTokenExpiry > NOW() LIMIT 1");
    $stmt->bindParam(':refresh_token', $refreshToken);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception("Invalid or expired refresh token");
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate new tokens
    $newToken = bin2hex(random_bytes(32));
    $newRefreshToken = bin2hex(random_bytes(32));
    
    // Set expiry times
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $refreshTokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));
    
    // Update tokens in database
    $stmt = $conn->prepare("UPDATE $tableName SET 
                        Token = :token,
                        RefreshToken = :refresh_token,
                        TokenExpiry = :token_expiry,
                        RefreshTokenExpiry = :refresh_token_expiry,
                        LastLogin = NOW()
                        WHERE UserID = :user_id");
    
    $stmt->bindParam(':token', $newToken);
    $stmt->bindParam(':refresh_token', $newRefreshToken);
    $stmt->bindParam(':token_expiry', $tokenExpiry);
    $stmt->bindParam(':refresh_token_expiry', $refreshTokenExpiry);
    $stmt->bindParam(':user_id', $user['UserID']);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update tokens");
    }
    
    // Prepare response data
    $responseData = [
        "token" => $newToken,
        "refreshToken" => $newRefreshToken,
        "tokenExpiry" => $tokenExpiry,
        "refreshTokenExpiry" => $refreshTokenExpiry
    ];
    
    sendResponse("success", "Token refreshed successfully", $responseData);
    
} catch (Exception $e) {
    error_log("Refresh token error: " . $e->getMessage());
    sendResponse("error", $e->getMessage());
}
?>
