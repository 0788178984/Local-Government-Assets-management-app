<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error logging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database and object files
include_once '../config/database.php';
include_once '../objects/user.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create user object
$user = new User($db);

// Set test user properties
$user->Username = "testuser";
$user->Email = "test@example.com";
$plainPassword = "password123";
$user->Password = $plainPassword; // Will be hashed in create() method
$user->UserRole = "Asset Manager";

// First check if the email already exists
if ($user->emailExists()) {
    echo json_encode(array(
        "message" => "Test user already exists",
        "email" => $user->Email,
        "username" => $user->Username
    ));
} else {
    // Create the user
    if ($user->create()) {
        echo json_encode(array(
            "message" => "Test user created successfully",
            "email" => $user->Email,
            "username" => $user->Username,
            "password" => $plainPassword, // Show the plain password for testing
            "role" => $user->UserRole
        ));
    } else {
        echo json_encode(array(
            "message" => "Failed to create test user"
        ));
    }
}
?>
