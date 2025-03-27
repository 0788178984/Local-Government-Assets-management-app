<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
ini_set('error_log', dirname(__FILE__) . '/logs/token_verification_error.log');

// Include database and required files
require_once 'config/database.php';
require_once 'config/core.php';

// Function to verify auth token
function verifyAuthToken($token) {
    try {
        // Include database configuration
        $database = new Database();
        $conn = $database->getConnection();
        
        if (!$conn) {
            throw new Exception("Database connection failed");
        }
        
        // First, check if users table exists (case sensitivity)
        $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
        $stmt->execute();
        $usersTableExists = $stmt->rowCount() > 0;
        
        $tableName = $usersTableExists ? 'users' : 'Users';
        
        // Query to get user with valid token
        $stmt = $conn->prepare("SELECT * FROM $tableName 
                               WHERE Token = :token 
                               AND TokenExpiry > NOW()
                               AND IsActive = 1");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Return user data
            return [
                "valid" => true,
                "user" => [
                    "UserID" => $user['UserID'],
                    "Username" => $user['Username'],
                    "Email" => $user['Email'] ?? $user['Username'],
                    "UserRole" => $user['UserRole']
                ],
                "token" => [
                    "expires_at" => $user['TokenExpiry'],
                    "refresh_token_expires_at" => $user['RefreshTokenExpiry']
                ]
            ];
        }
        
        return ["valid" => false, "message" => "Invalid or expired token"];
    } catch (Exception $e) {
        error_log("Error verifying token: " . $e->getMessage());
        return ["valid" => false, "message" => "Error verifying token: " . $e->getMessage()];
    }
}

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    http_response_code($status == "error" ? 401 : 200);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
    exit();
}

// If this file is called directly
if (basename($_SERVER['PHP_SELF']) == 'verify_token.php') {
    try {
        // Get authorization header
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        // Check if token exists in header
        if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            sendResponse("error", "Authorization token required");
        }
        
        $token = $matches[1];
        
        // Verify the token
        $result = verifyAuthToken($token);
        
        if ($result["valid"]) {
            sendResponse("success", "Token is valid", $result);
        } else {
            sendResponse("error", $result["message"]);
        }
    } catch (Exception $e) {
        error_log("Token verification exception: " . $e->getMessage());
        sendResponse("error", "Error verifying token: " . $e->getMessage());
    }
}
?>