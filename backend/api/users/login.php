<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database and object files
require_once '../config/database.php';
require_once '../objects/user.php';

try {
    // Get raw input data and log it
    $raw_data = file_get_contents("php://input");
    error_log("Raw request data: " . $raw_data);
    
    // Get posted data
    $data = json_decode($raw_data);
    
    // Log decoded data
    error_log("Decoded data: " . print_r($data, true));

    // Check if email and password are provided
    if (!empty($data) && isset($data->email) && isset($data->password)) {
        // Get database connection
        $database = new Database();
        $db = $database->getConnection();

        // Initialize user object
        $user = new User($db);
        
        // Set user email
        $user->Email = $data->email;
        error_log("Attempting login for email: " . $data->email);

        // Check if email exists
        if ($user->emailExists()) {
            error_log("Email exists, checking password");
            error_log("Stored hashed password: " . $user->Password);
            error_log("Provided password: " . $data->password);
            
            // Debug password verification
            $password_verified = password_verify($data->password, $user->Password);
            error_log("Password verification result: " . ($password_verified ? "true" : "false"));
            
            if ($password_verified) {
                error_log("Password verified successfully");
                
                // Update last login
                $user->updateLastLogin();

                // Return success response with user data
                http_response_code(200);
                echo json_encode(array(
                    "status" => "success",
                    "message" => "Login successful",
                    "data" => array(
                        "UserID" => $user->UserID,
                        "Username" => $user->Username,
                        "Email" => $user->Email,
                        "Role" => $user->UserRole
                    )
                ));
            } else {
                error_log("Password verification failed");
                http_response_code(401);
                echo json_encode(array(
                    "status" => "error",
                    "message" => "Invalid credentials"
                ));
            }
        } else {
            error_log("Email not found: " . $data->email);
            http_response_code(401);
            echo json_encode(array(
                "status" => "error",
                "message" => "Invalid credentials"
            ));
        }
    } else {
        error_log("Missing email or password");
        http_response_code(400);
        echo json_encode(array(
            "status" => "error",
            "message" => "Missing email or password"
        ));
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Server error occurred"
    ));
}