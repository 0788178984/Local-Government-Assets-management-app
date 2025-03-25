<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
        // Check if email already exists
        $check_query = "SELECT id FROM users WHERE email = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data->email]);
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Email already exists"
            ]);
            exit();
        }
        
        $query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        // For production, use proper password hashing
        $result = $stmt->execute([
            $data->name,
            $data->email,
            md5($data->password),
            $data->role ?? 'user'
        ]);
        
        if ($result) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "User registered successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Unable to register user"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Name, email, and password are required"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}

// Create a register endpoint to add a new admin user
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/admin-register') {
    $username = "admin";
    $email = "admin@admin.com";
    $password = "admin123"; // This will be hashed
    $role = "Admin";

    // First check if user exists
    $checkQuery = "SELECT Email FROM users WHERE Email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$email]);

    if ($checkStmt->rowCount() == 0) {
        // User doesn't exist, create new user
        $query = "INSERT INTO users (Username, Email, Password, UserRole, CreatedAt) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            $username,
            $email,
            md5($password),
            $role
        ]);

        if ($result) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Admin user created successfully",
                "data" => [
                    "email" => $email,
                    "password" => $password // Show the password in response for testing
                ]
            ]);
        } else {
            throw new Exception("Failed to create user");
        }
    } else {
        http_response_code(200);
        echo json_encode([
            "status" => "info",
            "message" => "Admin user already exists",
            "data" => [
                "email" => $email,
                "password" => $password
            ]
        ]);
    }
}
?>
