<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Include database configuration
require_once 'config/database.php';
require_once 'config/server_config.php';

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
    exit();
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    $updates = [];
    
    // Step 1: Determine which users table is being used
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    $usersTableExists = $stmt->rowCount() > 0;
    
    $stmt = $conn->prepare("SHOW TABLES LIKE 'Users'");
    $stmt->execute();
    $UsersTableExists = $stmt->rowCount() > 0;
    
    $tableName = $usersTableExists ? 'users' : ($UsersTableExists ? 'Users' : null);
    
    if (!$tableName) {
        throw new Exception("No users table found in the database");
    }
    
    $updates[] = "Found users table: $tableName";
    
    // Step 2: Check and add token columns if they don't exist
    $columns = ['Token', 'RefreshToken', 'TokenExpiry', 'RefreshTokenExpiry'];
    $addedColumns = [];
    
    foreach ($columns as $column) {
        $stmt = $conn->prepare("SHOW COLUMNS FROM `$tableName` LIKE '$column'");
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            // Column doesn't exist, add it
            if ($column === 'Token' || $column === 'RefreshToken') {
                $conn->exec("ALTER TABLE `$tableName` ADD `$column` VARCHAR(255) NULL");
            } else {
                $conn->exec("ALTER TABLE `$tableName` ADD `$column` DATETIME NULL");
            }
            $addedColumns[] = $column;
        }
    }
    
    if (count($addedColumns) > 0) {
        $updates[] = "Added missing columns to $tableName table: " . implode(', ', $addedColumns);
    } else {
        $updates[] = "All required columns already exist in $tableName table";
    }
    
    // Step 3: Check if admin user exists, create if not
    $stmt = $conn->prepare("SELECT * FROM `$tableName` WHERE Username = 'admin@localgov.com' OR Email = 'admin@localgov.com'");
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        // Create admin user
        $username = 'admin@localgov.com';
        $email = 'admin@localgov.com';
        $password = password_hash('password', PASSWORD_DEFAULT);
        $role = 'Admin';
        
        $stmt = $conn->prepare("INSERT INTO `$tableName` (Username, Email, Password, UserRole, CreatedAt, IsActive) 
                               VALUES (?, ?, ?, ?, NOW(), 1)");
        $stmt->bindParam(1, $username);
        $stmt->bindParam(2, $email);
        $stmt->bindParam(3, $password);
        $stmt->bindParam(4, $role);
        
        if ($stmt->execute()) {
            $updates[] = "Created admin user with credentials: admin@localgov.com / password";
        } else {
            $updates[] = "Failed to create admin user";
        }
    } else {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $updates[] = "Admin user already exists with ID: " . $user['UserID'];
        
        // Update the admin password anyway to ensure it works
        $password = password_hash('password', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE `$tableName` SET Password = ? WHERE UserID = ?");
        $stmt->bindParam(1, $password);
        $stmt->bindParam(2, $user['UserID']);
        
        if ($stmt->execute()) {
            $updates[] = "Updated admin password to: password";
        }
    }
    
    // Step 4: Generate login_url.php file with the current IP settings
    $ip = $server_config['ip'];
    $content = <<<PHP
<?php
// Generated automatically by update_config.php
// Current server IP: {$ip}

// Redirect to login_fix.php
header("Location: login_fix.php");
exit;
?>
PHP;

    $loginUrlFilePath = __DIR__ . '/users/login_url.php';
    file_put_contents($loginUrlFilePath, $content);
    $updates[] = "Created login_url.php with current IP: {$ip}";
    
    // Step 5: Create a redirect file for users/login.php
    $redirectContent = <<<PHP
<?php
// Generated automatically by update_config.php
// Current server IP: {$ip}

// Redirect to the root login_fix.php file
header("Location: ../login_fix.php");
exit;
?>
PHP;

    $loginRedirectPath = __DIR__ . '/users/login.php';
    file_put_contents($loginRedirectPath, $redirectContent);
    $updates[] = "Created redirect in users/login.php to point to login_fix.php";
    
    // Step 6: Create logs directory if it doesn't exist
    if (!file_exists(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0777, true);
        $updates[] = "Created logs directory";
    }
    
    sendResponse("success", "Configuration updated successfully", [
        'server_ip' => $ip,
        'database_name' => $db_config['name'],
        'users_table' => $tableName,
        'updates' => $updates,
        'login_credentials' => [
            'username' => 'admin@localgov.com',
            'password' => 'password'
        ]
    ]);
    
} catch (Exception $e) {
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
