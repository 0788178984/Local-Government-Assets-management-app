<?php
// Include server configuration
require_once 'server_config.php';

class Database {
    // Database credentials
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    // Constructor to initialize with server_config values
    public function __construct() {
        global $db_config;
        $this->host = $db_config['host'];
        $this->db_name = $db_config['name'];
        $this->username = $db_config['username'];
        $this->password = $db_config['password'];
    }

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8mb4");
            
            error_log("Database connection successful to {$this->db_name}");
            return $this->conn;
        } catch(PDOException $e) {
            // Log the error with detailed information
            error_log("Connection error: " . $e->getMessage() . " - Host: {$this->host}, DB: {$this->db_name}");
            
            // Return false instead of null to indicate connection failure
            return false;
        }
    }
}