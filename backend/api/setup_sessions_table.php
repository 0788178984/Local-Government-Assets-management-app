<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Include database configuration
    $baseDir = dirname(dirname(__DIR__));
    $configPath = $baseDir . '/backend/config/database.php';
    require_once $configPath;

    $database = new Database();
    $db = $database->getConnection();
    
    // Drop existing trigger if exists
    $dropTriggerQuery = "DROP TRIGGER IF EXISTS cleanup_expired_sessions";
    $db->exec($dropTriggerQuery);
    
    // Create user_sessions table
    $createTableQuery = "
    CREATE TABLE IF NOT EXISTS user_sessions (
        SessionID INT PRIMARY KEY AUTO_INCREMENT,
        UserID INT NOT NULL,
        Token VARCHAR(255) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ExpiresAt TIMESTAMP NULL,
        LastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES users(UserID),
        UNIQUE KEY unique_user_token (UserID, Token)
    ) ENGINE=InnoDB";
    
    $db->exec($createTableQuery);
    
    // Create index for token lookups
    $createIndexQuery = "CREATE INDEX IF NOT EXISTS idx_token ON user_sessions(Token)";
    $db->exec($createIndexQuery);
    
    // Create event for cleanup (instead of trigger)
    $createEventQuery = "
    CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
    ON SCHEDULE EVERY 1 HOUR
    DO
        DELETE FROM user_sessions WHERE ExpiresAt < CURRENT_TIMESTAMP
    ";
    
    // Enable event scheduler
    $db->exec("SET GLOBAL event_scheduler = ON");
    $db->exec($createEventQuery);
    
    // Verify table creation
    $checkTableQuery = "SHOW TABLES LIKE 'user_sessions'";
    $stmt = $db->query($checkTableQuery);
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        throw new Exception("Failed to create user_sessions table");
    }
    
    echo json_encode([
        "status" => "success",
        "message" => "User sessions table and cleanup event created successfully",
        "table_exists" => $tableExists
    ]);
    
} catch (Exception $e) {
    error_log("Setup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 