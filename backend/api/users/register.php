<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error logging
error_log("Register endpoint called");

// Include database and object files
include_once '../config/database.php';
include_once '../objects/user.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Prepare user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));
error_log("Register data received: " . print_r($data, true));

// Make sure data is not empty
if(
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password)
){
    // Set user property values
    $user->Username = $data->username;
    $user->Email = $data->email;
    $user->Password = $data->password; // Do NOT hash here - it will be hashed in the create method
    $user->UserRole = !empty($data->role) ? $data->role : "Asset Manager"; // Default role
    $user->CreatedAt = date('Y-m-d H:i:s');

    error_log("Checking if email exists: " . $data->email);
    // Check if email already exists
    if($user->emailExists()){
        error_log("Email already exists: " . $data->email);
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array(
            "status" => "error",
            "message" => "Email already exists."
        ));
        exit;
    }

    error_log("Creating new user with email: " . $data->email);
    // Create the user
    if($user->create()){
        error_log("User created successfully: " . $data->email);
        // Set response code - 201 created
        http_response_code(201);
        
        // Tell the user
        echo json_encode(array(
            "status" => "success",
            "message" => "User was created successfully."
        ));
    }
    // If unable to create the user
    else{
        error_log("Failed to create user: " . $data->email);
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array(
            "status" => "error",
            "message" => "Unable to create user."
        ));
    }
}
// Tell the user data is incomplete
else{
    error_log("Incomplete user data provided");
    // Set response code - 400 bad request
    http_response_code(400);
    
    // Tell the user
    echo json_encode(array(
        "status" => "error",
        "message" => "Unable to create user. Data is incomplete."
    ));
}
?>
