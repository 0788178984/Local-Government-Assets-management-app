<?php
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test 1: Check database connection
    echo "Test 1: Database Connection\n";
    if ($db) {
        echo "✓ Database connection successful\n\n";
    } else {
        echo "✗ Database connection failed\n\n";
        exit;
    }
    
    // Test 2: Show table structure
    echo "Test 2: Users Table Structure\n";
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Table columns:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']})\n";
    }
    echo "\n";
    
    // Test 3: List all users
    echo "Test 3: Existing Users\n";
    $stmt = $db->query("SELECT * FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($users) . " users:\n";
    foreach ($users as $user) {
        echo "- Username: {$user['Username']}, Email: {$user['Email']}, Role: {$user['UserRole']}\n";
    }
    echo "\n";
    
    // Test 4: Try to add a test admin
    echo "Test 4: Adding Test Admin\n";
    $testEmail = "testadmin@local.com";
    $testPassword = "admin123";
    
    // First check if test admin exists
    $stmt = $db->prepare("SELECT Email FROM users WHERE Email = ?");
    $stmt->execute([$testEmail]);
    
    if ($stmt->rowCount() == 0) {
        $query = "INSERT INTO users (Username, Email, Password, UserRole, CreatedAt) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            'Test Admin',
            $testEmail,
            md5($testPassword),
            'Admin'
        ]);
        
        if ($result) {
            echo "✓ Test admin created successfully\n";
            echo "Login credentials:\n";
            echo "Email: {$testEmail}\n";
            echo "Password: {$testPassword}\n";
        } else {
            echo "✗ Failed to create test admin\n";
        }
    } else {
        echo "ℹ Test admin already exists\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
