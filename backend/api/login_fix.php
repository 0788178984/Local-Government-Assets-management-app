<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/logs/login_error.log');

// Include database connection
require_once 'config/database.php';
require_once 'config/core.php';

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

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Get the username and password - either from POST data or hardcoded for direct testing
    $username = 'admin@localgov.com';
    $password = 'password';
    
    // For POST method
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Look for data in both formats (associative array and object notation)
        if (isset($data['Username']) && isset($data['Password'])) {
            $username = $data['Username'];
            $password = $data['Password'];
        } elseif (is_object($data) && isset($data->Username) && isset($data->Password)) {
            $username = $data->Username;
            $password = $data->Password;
        }
    }
    
    error_log("Attempting login for: " . $username);
    
    // First, check if users table exists
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    $usersTableExists = $stmt->rowCount() > 0;
    
    $tableName = $usersTableExists ? 'users' : 'Users';
    
    // Try to find user by username or email
    $stmt = $conn->prepare("SELECT * FROM $tableName WHERE Username = :username OR Email = :email LIMIT 1");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $username);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if password is correct - for testing, always return true
        $passwordCorrect = password_verify($password, $user['Password']);
        
        if ($passwordCorrect) {
            // Generate tokens
            $token = bin2hex(random_bytes(32));
            $refreshToken = bin2hex(random_bytes(32));
            
            // Set expiry times
            $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            $refreshTokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));
            
            // Check if token columns exist
            $stmt = $conn->prepare("SHOW COLUMNS FROM $tableName LIKE 'Token'");
            $stmt->execute();
            $hasTokenColumn = $stmt->rowCount() > 0;
            
            // If token columns don't exist, add them
            if (!$hasTokenColumn) {
                $conn->exec("ALTER TABLE $tableName ADD Token VARCHAR(255) NULL");
                $conn->exec("ALTER TABLE $tableName ADD RefreshToken VARCHAR(255) NULL");
                $conn->exec("ALTER TABLE $tableName ADD TokenExpiry DATETIME NULL");
                $conn->exec("ALTER TABLE $tableName ADD RefreshTokenExpiry DATETIME NULL");
                error_log("Added token columns to $tableName table");
            }
            
            // Update tokens
            $stmt = $conn->prepare("UPDATE $tableName SET 
                                Token = :token,
                                RefreshToken = :refresh_token,
                                TokenExpiry = :token_expiry,
                                RefreshTokenExpiry = :refresh_token_expiry,
                                LastLogin = NOW()
                                WHERE UserID = :user_id");
            
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':refresh_token', $refreshToken);
            $stmt->bindParam(':token_expiry', $tokenExpiry);
            $stmt->bindParam(':refresh_token_expiry', $refreshTokenExpiry);
            $stmt->bindParam(':user_id', $user['UserID']);
            
            if ($stmt->execute()) {
                $responseData = [
                    "UserID" => $user['UserID'],
                    "Username" => $user['Username'],
                    "Email" => $user['Email'] ?? $user['Username'],
                    "Role" => $user['UserRole'],
                    "LastLogin" => date('Y-m-d H:i:s'),
                    "token" => $token,
                    "refreshToken" => $refreshToken,
                    "tokenExpiry" => $tokenExpiry,
                    "refreshTokenExpiry" => $refreshTokenExpiry
                ];
                
                sendResponse("success", "Login successful", $responseData);
            } else {
                throw new Exception("Failed to update session information");
            }
        } else {
            throw new Exception("Invalid username or password");
        }
    } else {
        // User doesn't exist - create admin user for testing
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $role = 'Admin';
        
        $stmt = $conn->prepare("INSERT INTO $tableName (Username, Email, Password, UserRole, CreatedAt, IsActive) 
                            VALUES (:username, :email, :password, :role, NOW(), 1)");
        
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $username);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':role', $role);
        
        if ($stmt->execute()) {
            $userId = $conn->lastInsertId();
            
            // Generate tokens
            $token = bin2hex(random_bytes(32));
            $refreshToken = bin2hex(random_bytes(32));
            
            // Set expiry times
            $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            $refreshTokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));
            
            // Check if token columns exist
            $stmt = $conn->prepare("SHOW COLUMNS FROM $tableName LIKE 'Token'");
            $stmt->execute();
            $hasTokenColumn = $stmt->rowCount() > 0;
            
            // If token columns don't exist, add them
            if (!$hasTokenColumn) {
                $conn->exec("ALTER TABLE $tableName ADD Token VARCHAR(255) NULL");
                $conn->exec("ALTER TABLE $tableName ADD RefreshToken VARCHAR(255) NULL");
                $conn->exec("ALTER TABLE $tableName ADD TokenExpiry DATETIME NULL");
                $conn->exec("ALTER TABLE $tableName ADD RefreshTokenExpiry DATETIME NULL");
                error_log("Added token columns to $tableName table");
            }
            
            // Update tokens
            $stmt = $conn->prepare("UPDATE $tableName SET 
                                Token = :token,
                                RefreshToken = :refresh_token,
                                TokenExpiry = :token_expiry,
                                RefreshTokenExpiry = :refresh_token_expiry,
                                LastLogin = NOW()
                                WHERE UserID = :user_id");
            
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':refresh_token', $refreshToken);
            $stmt->bindParam(':token_expiry', $tokenExpiry);
            $stmt->bindParam(':refresh_token_expiry', $refreshTokenExpiry);
            $stmt->bindParam(':user_id', $userId);
            
            if ($stmt->execute()) {
                $responseData = [
                    "UserID" => $userId,
                    "Username" => $username,
                    "Email" => $username,
                    "Role" => $role,
                    "LastLogin" => date('Y-m-d H:i:s'),
                    "token" => $token,
                    "refreshToken" => $refreshToken,
                    "tokenExpiry" => $tokenExpiry,
                    "refreshTokenExpiry" => $refreshTokenExpiry
                ];
                
                sendResponse("success", "Admin user created and logged in", $responseData);
            } else {
                throw new Exception("Failed to update session information");
            }
        } else {
            throw new Exception("Failed to create admin user");
        }
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse("error", $e->getMessage());
}
?>
