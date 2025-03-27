<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

// Include database configuration
require_once 'config/database.php';
require_once 'config/server_config.php';

// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .config-item {
            margin-bottom: 10px;
        }
        .config-key {
            font-weight: bold;
        }
        .input-row {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>Local Government Asset Management Login Test</h1>
    
    <div class="container">
        <h2>Server Configuration</h2>
        <div class="config-item">
            <span class="config-key">Server IP:</span> <?php echo $server_config['ip']; ?>
        </div>
        <div class="config-item">
            <span class="config-key">Base Path:</span> <?php echo $server_config['base_path']; ?>
        </div>
        <div class="config-item">
            <span class="config-key">Port:</span> <?php echo $server_config['port']; ?>
        </div>
        <div class="config-item">
            <span class="config-key">API URL:</span> <?php echo "http://{$server_config['ip']}{$server_config['base_path']}/backend/api/"; ?>
        </div>
    </div>
    
    <div class="container">
        <h2>Database Connection</h2>
        <?php
        try {
            $database = new Database();
            $conn = $database->getConnection();
            
            if ($conn) {
                echo '<p class="success">Database connection successful!</p>';
                
                // Check users table
                $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
                $stmt->execute();
                $usersTableExists = $stmt->rowCount() > 0;
                
                $stmt = $conn->prepare("SHOW TABLES LIKE 'Users'");
                $stmt->execute();
                $UsersTableExists = $stmt->rowCount() > 0;
                
                $tableName = $usersTableExists ? 'users' : ($UsersTableExists ? 'Users' : null);
                
                if ($tableName) {
                    echo "<p>Users table name: <strong>{$tableName}</strong></p>";
                    
                    // Check count of users
                    $stmt = $conn->prepare("SELECT COUNT(*) as user_count FROM `{$tableName}`");
                    $stmt->execute();
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    echo "<p>Number of users in database: <strong>{$result['user_count']}</strong></p>";
                    
                    // Check if admin exists
                    $stmt = $conn->prepare("SELECT * FROM `{$tableName}` WHERE Username = 'admin@localgov.com' OR Email = 'admin@localgov.com'");
                    $stmt->execute();
                    
                    if ($stmt->rowCount() > 0) {
                        $user = $stmt->fetch(PDO::FETCH_ASSOC);
                        echo "<p class='success'>Admin user exists with ID: {$user['UserID']}</p>";
                        echo "<p>Username: {$user['Username']}</p>";
                        echo "<p>Email: {$user['Email']}</p>";
                        
                        // Check if token columns exist
                        $stmt = $conn->prepare("SHOW COLUMNS FROM `{$tableName}` LIKE 'Token'");
                        $stmt->execute();
                        $hasTokenColumn = $stmt->rowCount() > 0;
                        
                        if ($hasTokenColumn) {
                            echo "<p class='success'>Token columns exist in the database</p>";
                        } else {
                            echo "<p class='error'>Token columns are missing! Run update_config.php first.</p>";
                        }
                    } else {
                        echo "<p class='error'>Admin user does not exist! Run update_config.php first.</p>";
                    }
                } else {
                    echo "<p class='error'>No users table found in the database!</p>";
                }
            } else {
                echo '<p class="error">Database connection failed!</p>';
            }
        } catch (Exception $e) {
            echo '<p class="error">Error: ' . $e->getMessage() . '</p>';
        }
        ?>
    </div>
    
    <div class="container">
        <h2>Test Direct Login</h2>
        <form id="loginForm">
            <div class="input-row">
                <label for="username">Username/Email:</label>
                <input type="text" id="username" name="username" value="admin@localgov.com" required>
            </div>
            <div class="input-row">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" value="password" required>
            </div>
            <button type="submit">Test Login</button>
        </form>
        <div id="loginResult"></div>
    </div>
    
    <div class="container">
        <h2>Available API Endpoints</h2>
        <ul>
            <li><a href="login_fix.php" target="_blank">login_fix.php</a> - Working login endpoint</li>
            <li><a href="refresh.php" target="_blank">refresh.php</a> - Token refresh endpoint (POST only)</li>
            <li><a href="update_config.php" target="_blank">update_config.php</a> - Update configuration and database</li>
            <li><a href="check_db_structure.php" target="_blank">check_db_structure.php</a> - Check database structure</li>
        </ul>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('loginResult');
            
            resultDiv.innerHTML = '<p>Testing login...</p>';
            
            fetch('login_fix.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Username: username,
                    Password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    resultDiv.innerHTML = `
                        <p class="success">Login successful!</p>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <p class="error">Login failed: ${data.message}</p>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    `;
                }
            })
            .catch(error => {
                resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            });
        });
    </script>
</body>
</html>
