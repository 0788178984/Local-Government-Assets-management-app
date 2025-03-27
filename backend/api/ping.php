<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Include server configuration
include_once './config/server_config.php';

// Create response
$response = array(
    "status" => "success",
    "message" => "Server is up and running",
    "timestamp" => date("Y-m-d H:i:s"),
    "server_info" => array(
        "ip" => $_SERVER['SERVER_ADDR'] ?? 'unknown',
        "host" => $_SERVER['HTTP_HOST'] ?? 'unknown'
    ),
    "config" => array(
        "base_url" => SERVER_BASE_URL,
        "api_url" => SERVER_API_URL
    )
);

// Return JSON response
echo json_encode($response);
?>