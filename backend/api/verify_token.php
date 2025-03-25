<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

function verifyAuthToken($token) {
    try {
        // Include database configuration
        $baseDir = dirname(dirname(__DIR__));
        $configPath = $baseDir . '/backend/config/database.php';
        require_once $configPath;

        $database = new Database();
        $db = $database->getConnection();
        
        // Query to get valid session
        $query = "
            SELECT s.*, u.Username, u.Email, u.UserRole 
            FROM user_sessions s
            JOIN users u ON s.UserID = u.UserID
            WHERE s.Token = ? 
            AND s.ExpiresAt > CURRENT_TIMESTAMP
            AND u.IsActive = 1
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$token]);
        
        if ($stmt->rowCount() > 0) {
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Update last activity
            $updateQuery = "UPDATE user_sessions SET LastActivity = CURRENT_TIMESTAMP WHERE SessionID = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$session['SessionID']]);
            
            return [
                "valid" => true,
                "user" => [
                    "UserID" => $session['UserID'],
                    "Username" => $session['Username'],
                    "Email" => $session['Email'],
                    "UserRole" => $session['UserRole']
                ],
                "session" => [
                    "expires_at" => $session['ExpiresAt'],
                    "last_activity" => $session['LastActivity']
                ]
            ];
        }
        
        return ["valid" => false, "message" => "Invalid or expired token"];
        
    } catch (Exception $e) {
        error_log("Token verification error: " . $e->getMessage());
        return ["valid" => false, "message" => "Error verifying token"];
    }
}

// If this file is called directly
if (basename($_SERVER['PHP_SELF']) == 'verify_token.php') {
    try {
        // Get authorization header
        $headers = getallheaders();
        $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        // Check for token in header or POST data
        if (empty($auth)) {
            $data = json_decode(file_get_contents("php://input"));
            $token = isset($data->token) ? $data->token : '';
        } else {
            // Remove 'Bearer ' if present
            $token = str_replace('Bearer ', '', $auth);
        }
        
        if (empty($token)) {
            throw new Exception("No token provided");
        }
        
        $result = verifyAuthToken($token);
        
        if ($result['valid']) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Token is valid",
                "data" => $result
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => $result['message']
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Token verification endpoint error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
?> 