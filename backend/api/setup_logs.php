<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Path to logs directory
$logsDir = __DIR__ . '/logs';

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
    exit();
}

// Create logs directory if it doesn't exist
if (!file_exists($logsDir)) {
    if (mkdir($logsDir, 0755, true)) {
        $result['logs_dir'] = "Created logs directory";
    } else {
        $result['logs_dir'] = "Failed to create logs directory";
    }
} else {
    $result['logs_dir'] = "Logs directory already exists";
}

// Create or touch error log files
$logFiles = [
    'login_error.log',
    'auth_error.log',
    'general_error.log'
];

foreach ($logFiles as $logFile) {
    $filePath = $logsDir . '/' . $logFile;
    if (!file_exists($filePath)) {
        if (touch($filePath)) {
            $result['log_files'][$logFile] = "Created log file";
        } else {
            $result['log_files'][$logFile] = "Failed to create log file";
        }
    } else {
        $result['log_files'][$logFile] = "Log file already exists";
    }
}

// Set permissions for the logs directory
if (chmod($logsDir, 0755)) {
    $result['permissions'] = "Set permissions for logs directory";
} else {
    $result['permissions'] = "Failed to set permissions for logs directory";
}

// Return response
sendResponse("success", "Logs setup completed", $result);
?>
