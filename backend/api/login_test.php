<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Fix database config path
$baseDir = dirname(dirname(__DIR__));
$configPath = $baseDir . '/backend/config/database.php';

// Log the config path being used
error_log("Using config path: " . $configPath);

// Test login with default admin credentials
$testData = [
    "email" => "admin@localgov.com",
    "password" => "password"
];

// Get the current server's hostname or IP
$server = $_SERVER['HTTP_HOST'] ?? 'localhost';
$endpoint = "http://{$server}/LocalGovtAssetMgt_App/backend/api/login.php";

// Initialize cURL
$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($testData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_VERBOSE => true,
    CURLOPT_HEADER => true,
    CURLINFO_HEADER_OUT => true,
    CURLOPT_SSL_VERIFYPEER => false
]);

// Create a temporary file to store curl verbose output
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

// Execute the request
$response = curl_exec($ch);

// Get response headers and body
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $header_size);
$body = substr($response, $header_size);

// Get additional info
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$info = curl_getinfo($ch);

// Get verbose information
rewind($verbose);
$verboseLog = stream_get_contents($verbose);

curl_close($ch);

// Test database connection
$dbTest = [];
try {
    if (!file_exists($configPath)) {
        throw new Exception("Database configuration file not found at: " . $configPath);
    }
    
    require_once $configPath;
    $database = new Database();
    $db = $database->getConnection();
    $dbTest['connection'] = 'success';
    
    // Test users table
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $dbTest['users_count'] = $result['count'];
} catch (Exception $e) {
    $dbTest['connection'] = 'failed';
    $dbTest['error'] = $e->getMessage();
    $dbTest['file_exists'] = file_exists($configPath);
    $dbTest['config_path'] = $configPath;
}

// Format the output
$result = [
    "status" => "test_complete",
    "endpoint_tested" => $endpoint,
    "test_credentials" => $testData,
    "http_code" => $httpCode,
    "curl_error" => $error ?: null,
    "response_headers" => $header,
    "response_body" => json_decode($body, true),
    "curl_info" => $info,
    "verbose_log" => $verboseLog,
    "database_test" => $dbTest
];

echo json_encode($result, JSON_PRETTY_PRINT);
?> 