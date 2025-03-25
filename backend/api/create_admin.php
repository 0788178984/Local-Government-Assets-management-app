<?php
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test admin credentials
    $username = "admin";
    $email = "admin@localgov.com";
    $password = "admin123";
    $role = "Admin";
    
    // Check if admin already exists
    $checkQuery = "SELECT UserID FROM Users WHERE Email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$email]);
    
    if ($checkStmt->rowCount() == 0) {
        // Create admin user
        $query = "INSERT INTO Users (Username, Email, Password, UserRole, CreatedAt, IsActive) 
                 VALUES (?, ?, ?, ?, NOW(), TRUE)";
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            $username,
            $email,
            md5($password),
            $role
        ]);
        
        if ($result) {
            echo json_encode([
                "status" => "success",
                "message" => "Admin user created successfully",
                "data" => [
                    "email" => $email,
                    "password" => $password
                ]
            ]);
        } else {
            throw new Exception("Failed to create admin user");
        }
    } else {
        echo json_encode([
            "status" => "info",
            "message" => "Admin user already exists",
            "data" => [
                "email" => $email,
                "password" => $password
            ]
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