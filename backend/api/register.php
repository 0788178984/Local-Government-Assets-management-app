<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

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
?>
