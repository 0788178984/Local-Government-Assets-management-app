<?php
// Include necessary files
require_once 'config/database.php';
require_once 'config/core.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to get server information
function getServerInfo() {
    return [
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'server_addr' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'http_host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
        'php_version' => PHP_VERSION,
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'request_time' => date('Y-m-d H:i:s'),
        'server_config' => [
            'ip' => $GLOBALS['server_config']['ip'],
            'base_path' => $GLOBALS['server_config']['base_path'],
            'port' => $GLOBALS['server_config']['port'],
            'api_path' => $GLOBALS['server_config']['api_path']
        ],
        'db_config' => [
            'host' => $GLOBALS['db_config']['host'],
            'name' => $GLOBALS['db_config']['name']
        ]
    ];
}

// Function to check users table schema
function checkUsersTable($conn) {
    try {
        // Query to get table schema
        $stmt = $conn->prepare("DESCRIBE users");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $columnNames = [];
        foreach ($columns as $column) {
            $columnNames[] = [
                'name' => $column['Field'],
                'type' => $column['Type']
            ];
        }
        
        return $columnNames;
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

try {
    // Create response object
    $response = [
        'status' => 'checking',
        'server_info' => getServerInfo(),
        'database' => [],
        'users_table' => []
    ];
    
    // Test database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        $response['database'] = [
            'status' => 'connected',
            'message' => 'Successfully connected to database'
        ];
        
        // Check users table
        $usersTable = checkUsersTable($conn);
        $response['users_table'] = $usersTable;
        
        $response['status'] = 'success';
    } else {
        $response['database'] = [
            'status' => 'error',
            'message' => 'Failed to connect to database'
        ];
        $response['status'] = 'error';
    }
    
    // Return JSON response
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}