<?php
// Include necessary headers and database connection
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (
        !empty($data->username) &&
        !empty($data->email) &&
        !empty($data->password) &&
        !empty($data->userRole)
    ) {
        // Check if email exists
        $emailCheck = "SELECT UserID FROM Users WHERE Email = ?";
        $stmt = $db->prepare($emailCheck);
        $stmt->execute([$data->email]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Email already exists"
            ]);
            exit;
        }
        
        // Create user
        $query = "INSERT INTO Users (Username, Email, Password, UserRole, CreatedAt, IsActive) 
                 VALUES (?, ?, ?, ?, NOW(), ?)";
        
        $stmt = $db->prepare($query);
        $password = md5($data->password);
        $isActive = isset($data->isActive) ? $data->isActive : true;
        
        $result = $stmt->execute([
            $data->username,
            $data->email,
            $password,
            $data->userRole,
            $isActive
        ]);
        
        if ($result) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "User created successfully"
            ]);
        } else {
            throw new Exception("Failed to create user");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data. Username, email, password and role are required."
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?> 