<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getServerIPv4() {
    $ipAddresses = array();
    
    // Get IP from network interfaces
    $output = shell_exec("ipconfig");
    preg_match_all('/IPv4 Address[^:]+: ([\d\.]+)/', $output, $matches);
    if (!empty($matches[1])) {
        $ipAddresses['network_interfaces'] = $matches[1];
    }
    
    // Get IP from server variables
    $ipAddresses['server_addr'] = $_SERVER['SERVER_ADDR'] ?? 'unknown';
    $ipAddresses['local_addr'] = $_SERVER['LOCAL_ADDR'] ?? 'unknown';
    $ipAddresses['remote_addr'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    return $ipAddresses;
}

try {
    // Get all server information
    $serverInfo = [
        'ip_addresses' => getServerIPv4(),
        'server_name' => $_SERVER['SERVER_NAME'],
        'server_port' => $_SERVER['SERVER_PORT'],
        'request_time' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'http_host' => $_SERVER['HTTP_HOST'],
        'request_uri' => $_SERVER['REQUEST_URI']
    ];

    // Test database connection
    $baseDir = dirname(dirname(__DIR__));
    $configPath = $baseDir . '/backend/config/database.php';
    require_once $configPath;

    $database = new Database();
    $db = $database->getConnection();
    
    $dbStatus = $db ? "Connected" : "Failed";

    // Get suggested URLs for mobile app
    $ipv4Addresses = $serverInfo['ip_addresses']['network_interfaces'] ?? [];
    $suggestedUrls = array();
    foreach ($ipv4Addresses as $ip) {
        $suggestedUrls[] = "http://$ip/LocalGovtAssetMgt_App/backend/api";
    }
    $suggestedUrls[] = "http://10.0.2.2/LocalGovtAssetMgt_App/backend/api"; // Android Emulator
    $suggestedUrls[] = "http://localhost/LocalGovtAssetMgt_App/backend/api"; // Local testing

    echo json_encode([
        "status" => "success",
        "message" => "API is reachable",
        "server_info" => $serverInfo,
        "database_status" => $dbStatus,
        "suggested_urls" => $suggestedUrls,
        "instructions" => [
            "1. Make sure your phone and computer are on the same network",
            "2. Try each suggested URL in your mobile app configuration",
            "3. If using an emulator, use the 10.0.2.2 URL",
            "4. Check if Windows Firewall is blocking connections",
            "5. Ensure Apache is listening on all interfaces (0.0.0.0:80)"
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 