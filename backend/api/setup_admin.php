<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Include database configuration
    $baseDir = dirname(dirname(__DIR__));
    $configPath = $baseDir . '/backend/config/database.php';
    require_once $configPath;

    $database = new Database();
    $db = $database->getConnection();
    
    // Admin user data
    $adminData = [
        'email' => 'admin@localgov.com',
        'username' => 'AdminUser',
        'password' => 'password',
        'role' => 'Admin'
    ];
    
    // Check if admin exists
    $checkQuery = "SELECT UserID FROM users WHERE Email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$adminData['email']]);
    $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingUser) {
        // Update existing admin
        $updateQuery = "UPDATE users SET 
            Password = MD5(?),
            UserRole = ?,
            IsActive = 1,
            AuthProvider = 'Local'
            WHERE UserID = ?";
        
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([
            $adminData['password'],
            $adminData['role'],
            $existingUser['UserID']
        ]);
        
        echo json_encode([
            "status" => "success",
            "message" => "Admin user updated successfully",
            "user_id" => $existingUser['UserID']
        ]);
    } else {
        // Create new admin
        $insertQuery = "INSERT INTO users (
            Username, Email, Password, UserRole, IsActive, AuthProvider
        ) VALUES (?, ?, MD5(?), ?, 1, 'Local')";
        
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([
            $adminData['username'],
            $adminData['email'],
            $adminData['password'],
            $adminData['role']
        ]);
        
        echo json_encode([
            "status" => "success",
            "message" => "Admin user created successfully",
            "user_id" => $db->lastInsertId()
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 