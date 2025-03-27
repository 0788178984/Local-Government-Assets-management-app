<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and core configuration
include_once '../config/database.php';
include_once '../config/core.php';
include_once '../objects/user.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if refresh token was provided
if (!isset($data->refreshToken)) {
    http_response_code(400);
    echo json_encode(array(
        "status" => "error",
        "message" => "Refresh token is required."
    ));
    exit();
}

try {
    // Verify the refresh token
    $refreshToken = $data->refreshToken;
    
    // Get user data from refresh token
    $stmt = $user->getUserByRefreshToken($refreshToken);
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if refresh token is expired
        $refreshTokenExpiry = strtotime($row['refresh_token_expiry']);
        if ($refreshTokenExpiry < time()) {
            http_response_code(401);
            echo json_encode(array(
                "status" => "error",
                "message" => "Refresh token has expired."
            ));
            exit();
        }
        
        // Generate new tokens
        $newToken = bin2hex(random_bytes(32));
        $newRefreshToken = bin2hex(random_bytes(32));
        
        // Set expiry times
        $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $refreshTokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        // Update tokens in database
        if ($user->updateTokens($row['UserID'], $newToken, $newRefreshToken, $tokenExpiry, $refreshTokenExpiry)) {
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Token refreshed successfully.",
                "token" => $newToken,
                "refreshToken" => $newRefreshToken,
                "tokenExpiry" => $tokenExpiry,
                "refreshTokenExpiry" => $refreshTokenExpiry
            ));
        } else {
            throw new Exception("Failed to update tokens.");
        }
    } else {
        http_response_code(401);
        echo json_encode(array(
            "status" => "error",
            "message" => "Invalid refresh token."
        ));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Error refreshing token: " . $e->getMessage()
    ));
}
