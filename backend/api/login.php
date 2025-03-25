<?php
// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Fix database config path
$baseDir = dirname(dirname(__DIR__));
$configPath = $baseDir . '/backend/config/database.php';

// Log the config path and current directory
error_log("Current directory: " . __DIR__);
error_log("Using config path: " . $configPath);
error_log("Base directory: " . $baseDir);

// Log request method and headers
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . json_encode(getallheaders()));

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed. Use POST."
    ]);
    exit();
}

// Get raw input and log it
$raw_input = file_get_contents("php://input");
error_log("Raw input received: " . $raw_input);

try {
    // Check if config file exists
    if (!file_exists($configPath)) {
        throw new Exception("Database configuration file not found at: " . $configPath);
    }
    
    require_once $configPath;

    // Parse input data
    $data = json_decode($raw_input);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format: " . json_last_error_msg());
    }
    
    // Validate input
    if (!isset($data->email) || !isset($data->password)) {
        throw new Exception("Email and password are required");
    }

    if (empty($data->email) || empty($data->password)) {
        throw new Exception("Email and password cannot be empty");
    }

    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Prepare query with UserRole
    $query = "SELECT UserID, Username, Email, UserRole, IsActive FROM users WHERE Email = ? AND Password = MD5(?) AND IsActive = 1";
    error_log("Executing query for email: " . $data->email);
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Query preparation failed");
    }
    
    // Sanitize input
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $password = htmlspecialchars(strip_tags($data->password));
    
    // Execute query
    $stmt->execute([$email, $password]);
    
    // Check if user exists and is active
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate token with expiration
        $tokenExpiry = time() + (24 * 60 * 60); // 24 hours
        $tokenData = [
            'user_id' => $user['UserID'],
            'email' => $user['Email'],
            'role' => $user['UserRole'],
            'exp' => $tokenExpiry
        ];
        $token = bin2hex(random_bytes(32));
        
        // Store token in database
        $tokenQuery = "INSERT INTO user_sessions (UserID, Token, ExpiresAt) VALUES (?, ?, FROM_UNIXTIME(?))
                      ON DUPLICATE KEY UPDATE Token = VALUES(Token), ExpiresAt = VALUES(ExpiresAt)";
        $tokenStmt = $db->prepare($tokenQuery);
        $tokenStmt->execute([$user['UserID'], $token, $tokenExpiry]);
        
        // Update last login timestamp
        $updateQuery = "UPDATE users SET LastLogin = CURRENT_TIMESTAMP WHERE UserID = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$user['UserID']]);
        
        $response = [
            "status" => "success",
            "message" => "Login successful",
            "data" => [
                "UserID" => $user['UserID'],
                "Username" => $user['Username'],
                "Email" => $user['Email'],
                "UserRole" => $user['UserRole'],
                "token" => $token,
                "expires_at" => date('Y-m-d H:i:s', $tokenExpiry)
            ]
        ];
        
        error_log("Login successful for user: " . $email);
        http_response_code(200);
        echo json_encode($response);
    } else {
        // Check if user exists but password is wrong
        $checkQuery = "SELECT IsActive FROM users WHERE Email = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$email]);
        $userExists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userExists) {
            if ($userExists['IsActive'] == 0) {
                throw new Exception("Account is inactive");
            }
            error_log("Invalid password for user: " . $email);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Invalid email or password"
            ]);
        } else {
            error_log("User not found: " . $email);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Invalid email or password"
            ]);
        }
    }

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Login failed: " . $e->getMessage(),
        "debug_info" => [
            "config_path" => $configPath,
            "file_exists" => file_exists($configPath),
            "current_dir" => __DIR__,
            "base_dir" => $baseDir
        ]
    ]);
}
?>
