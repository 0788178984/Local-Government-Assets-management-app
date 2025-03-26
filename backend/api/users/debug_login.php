<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../config/database.php';
include_once '../objects/user.php';

// Function to safely display data
function safeOutput($data) {
    return htmlspecialchars(print_r($data, true), ENT_QUOTES, 'UTF-8');
}

$output = [];
$output[] = "<h1>Login Debugging Tool</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $query = "DESCRIBE Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tableStructure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $output[] = "<h2>Users Table Structure</h2>";
    $output[] = "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($tableStructure as $column) {
        $output[] = "<tr>";
        foreach ($column as $key => $value) {
            $output[] = "<td>" . safeOutput($value) . "</td>";
        }
        $output[] = "</tr>";
    }
    $output[] = "</table>";
    
    // Get all users (excluding password for security)
    $query = "SELECT UserID, Username, Email, UserRole, CreatedAt, LastLogin, IsActive, AuthProvider FROM Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $output[] = "<h2>Users in Database</h2>";
    if (count($users) > 0) {
        $output[] = "<table border='1'><tr>";
        foreach (array_keys($users[0]) as $header) {
            $output[] = "<th>" . safeOutput($header) . "</th>";
        }
        $output[] = "</tr>";
        
        foreach ($users as $user) {
            $output[] = "<tr>";
            foreach ($user as $value) {
                $output[] = "<td>" . safeOutput($value) . "</td>";
            }
            $output[] = "</tr>";
        }
        $output[] = "</table>";
    } else {
        $output[] = "<p>No users found in database.</p>";
    }
    
    // Create a test login form
    $output[] = "<h2>Test Login</h2>";
    $output[] = "<form method='post'>";
    $output[] = "<p><label>Email: <input type='email' name='email' required></label></p>";
    $output[] = "<p><label>Password: <input type='password' name='password' required></label></p>";
    $output[] = "<p><button type='submit' name='login'>Test Login</button></p>";
    $output[] = "</form>";
    
    // Process login test if form submitted
    if (isset($_POST['login'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];
        
        $output[] = "<h3>Login Test Results</h3>";
        $output[] = "<p>Attempting login with email: " . safeOutput($email) . "</p>";
        
        $user = new User($db);
        $user->Email = $email;
        
        if ($user->emailExists()) {
            $output[] = "<p style='color:green'>✓ Email found in database</p>";
            $output[] = "<p>User details:<br>";
            $output[] = "UserID: " . safeOutput($user->UserID) . "<br>";
            $output[] = "Username: " . safeOutput($user->Username) . "<br>";
            $output[] = "UserRole: " . safeOutput($user->UserRole) . "<br>";
            $output[] = "Stored password hash: " . safeOutput($user->Password) . "</p>";
            
            $password_verified = password_verify($password, $user->Password);
            if ($password_verified) {
                $output[] = "<p style='color:green'>✓ Password verified successfully</p>";
                $output[] = "<p style='color:green;font-weight:bold'>Login would be successful!</p>";
            } else {
                $output[] = "<p style='color:red'>✗ Password verification failed</p>";
                
                // For debugging only - show what's happening with the password
                $output[] = "<p>Debug info (remove in production):<br>";
                $output[] = "Password algorithm: " . safeOutput(password_get_info($user->Password)['algoName']) . "<br>";
                $output[] = "Test hash of provided password: " . safeOutput(password_hash($password, PASSWORD_BCRYPT)) . "</p>";
            }
        } else {
            $output[] = "<p style='color:red'>✗ Email not found in database</p>";
        }
    }
    
    // Create a test user section
    $output[] = "<h2>Create Test User</h2>";
    $output[] = "<form method='post'>";
    $output[] = "<p><label>Username: <input type='text' name='username' value='testuser' required></label></p>";
    $output[] = "<p><label>Email: <input type='email' name='email' value='test@example.com' required></label></p>";
    $output[] = "<p><label>Password: <input type='text' name='password' value='password123' required></label></p>";
    $output[] = "<p><label>Role: <select name='role'>";
    $output[] = "<option value='Admin'>Admin</option>";
    $output[] = "<option value='Asset Manager' selected>Asset Manager</option>";
    $output[] = "<option value='Maintenance Team'>Maintenance Team</option>";
    $output[] = "</select></label></p>";
    $output[] = "<p><button type='submit' name='create'>Create User</button></p>";
    $output[] = "</form>";
    
    // Process user creation if form submitted
    if (isset($_POST['create'])) {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $role = $_POST['role'];
        
        $output[] = "<h3>User Creation Results</h3>";
        
        $user = new User($db);
        $user->Username = $username;
        $user->Email = $email;
        $user->Password = $password;
        $user->UserRole = $role;
        
        if ($user->emailExists()) {
            $output[] = "<p style='color:orange'>⚠ Email already exists</p>";
        } else {
            if ($user->create()) {
                $output[] = "<p style='color:green'>✓ User created successfully</p>";
                $output[] = "<p>Username: " . safeOutput($username) . "<br>";
                $output[] = "Email: " . safeOutput($email) . "<br>";
                $output[] = "Password: " . safeOutput($password) . " (plain text for testing only)<br>";
                $output[] = "Role: " . safeOutput($role) . "</p>";
            } else {
                $output[] = "<p style='color:red'>✗ Failed to create user</p>";
            }
        }
    }
    
} catch (Exception $e) {
    $output[] = "<div style='color:red;background:#ffeeee;padding:10px;border:1px solid red'>";
    $output[] = "<h2>Error Occurred</h2>";
    $output[] = "<p>" . safeOutput($e->getMessage()) . "</p>";
    $output[] = "</div>";
}

// Output all the collected HTML
echo implode("\n", $output);
?>
