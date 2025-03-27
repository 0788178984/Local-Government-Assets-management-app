<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Include database configuration
require_once 'config/database.php';

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
    
    // Get database information
    $dbName = $GLOBALS['db_config']['name'];
    
    // Check all tables in the database
    $tables = [];
    $stmt = $conn->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    // Check users table specifically
    $usersTableExists = in_array('users', $tables);
    $UsersTableExists = in_array('Users', $tables);
    
    $tableStructure = [];
    
    // Check structure for both possible table names (case sensitivity)
    foreach (['users', 'Users'] as $tableName) {
        if (in_array($tableName, $tables)) {
            // Get table structure
            $stmt = $conn->query("DESCRIBE $tableName");
            $columns = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $columns[] = $row;
            }
            
            $tableStructure[$tableName] = $columns;
            
            // Count records
            $stmt = $conn->query("SELECT COUNT(*) as count FROM $tableName");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $recordCount[$tableName] = $row['count'];
            
            // Get sample records (limit to 3)
            $stmt = $conn->query("SELECT * FROM $tableName LIMIT 3");
            $records = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Mask password
                if (isset($row['Password'])) {
                    $row['Password'] = '********';
                }
                $records[] = $row;
            }
            $sampleRecords[$tableName] = $records;
        }
    }
    
    // Create admin user if users table exists but admin doesn't
    $adminExists = false;
    $adminCreated = false;
    $activeTable = '';
    
    // Determine which table to use
    if ($usersTableExists) {
        $activeTable = 'users';
    } elseif ($UsersTableExists) {
        $activeTable = 'Users';
    }
    
    if ($activeTable) {
        // Check if admin user exists
        $stmt = $conn->prepare("SELECT * FROM $activeTable WHERE Username = ? OR Email = ?");
        $adminEmail = 'admin@localgov.com';
        $stmt->bindParam(1, $adminEmail);
        $stmt->bindParam(2, $adminEmail);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $adminExists = true;
            $adminDetails = $stmt->fetch(PDO::FETCH_ASSOC);
            // Mask password
            if (isset($adminDetails['Password'])) {
                $adminDetails['Password'] = '********';
            }
        } else {
            // Create admin user
            $username = 'admin@localgov.com';
            $email = 'admin@localgov.com';
            $password = password_hash('password', PASSWORD_DEFAULT);
            $role = 'Admin';
            
            $stmt = $conn->prepare("INSERT INTO $activeTable (Username, Email, Password, UserRole, CreatedAt, IsActive) 
                                   VALUES (?, ?, ?, ?, NOW(), 1)");
            $stmt->bindParam(1, $username);
            $stmt->bindParam(2, $email);
            $stmt->bindParam(3, $password);
            $stmt->bindParam(4, $role);
            
            if ($stmt->execute()) {
                $adminCreated = true;
                $adminId = $conn->lastInsertId();
            }
        }
    }
    
    sendResponse("success", "Database structure checked", [
        'database_name' => $dbName,
        'tables' => $tables,
        'users_table_lowercase_exists' => $usersTableExists,
        'Users_table_uppercase_exists' => $UsersTableExists,
        'active_table' => $activeTable,
        'table_structure' => $tableStructure,
        'record_count' => $recordCount ?? [],
        'sample_records' => $sampleRecords ?? [],
        'admin_user' => [
            'exists' => $adminExists,
            'created' => $adminCreated,
            'details' => $adminDetails ?? null,
            'created_id' => $adminId ?? null
        ]
    ]);
    
} catch (Exception $e) {
    sendResponse("error", "An error occurred: " . $e->getMessage());
}
?>
