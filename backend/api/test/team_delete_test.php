<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable detailed error reporting for this test file
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log all request information
error_log("TEST ENDPOINT: Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("TEST ENDPOINT: Request headers: " . json_encode(getallheaders()));

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    echo json_encode(array("status" => "success", "message" => "Preflight request successful"));
    exit();
}

// Log query parameters and post data
error_log("TEST ENDPOINT: GET params: " . json_encode($_GET));
error_log("TEST ENDPOINT: POST params: " . json_encode($_POST));

// Get raw input
$rawData = file_get_contents("php://input");
error_log("TEST ENDPOINT: Raw input: " . $rawData);

// Try to decode JSON
$jsonData = json_decode($rawData, true);
$jsonError = json_last_error();
error_log("TEST ENDPOINT: JSON decode result: " . ($jsonError === JSON_ERROR_NONE ? 'Success' : 'Error: ' . json_last_error_msg()));

// Create test response
$response = array(
    "status" => "success",
    "message" => "Test endpoint successful",
    "received" => array(
        "method" => $_SERVER['REQUEST_METHOD'],
        "get" => $_GET,
        "post" => $_POST,
        "raw" => $rawData,
        "json" => $jsonData,
        "json_error" => $jsonError === JSON_ERROR_NONE ? null : json_last_error_msg()
    ),
    "test_results" => array(
        "echo_test" => "This is a simple echo test"
    )
);

// Return the response
http_response_code(200);
echo json_encode($response);
?> 