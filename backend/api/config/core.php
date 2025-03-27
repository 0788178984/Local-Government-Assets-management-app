<?php
// Include server configuration
require_once 'server_config.php';

// Show error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable displaying errors to client
ini_set('log_errors', 1); // Enable error logging
ini_set('error_log', dirname(__FILE__) . '/error.log'); // Set error log file

// Set timezone
date_default_timezone_set('Africa/Kampala');

// Variables used for JWT
$key = "your_secret_key_here";
$issued_at = time();
$expiration_time = $issued_at + (60 * 60); // valid for 1 hour
$issuer = SERVER_BASE_URL; // Use the constant from server_config.php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>