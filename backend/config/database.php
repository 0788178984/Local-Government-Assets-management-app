<?php
class Database {
    private $host = "localhost";
    private $db_name = "local_govt_assets";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log("Database connection successful");
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection error: " . $exception->getMessage());
        }

        return $this->conn;
    }

    // Add method to test if database exists
    public function databaseExists() {
        try {
            $pdo = new PDO(
                "mysql:host=" . $this->host,
                $this->username,
                $this->password
            );
            
            $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . $this->db_name . "'");
            return $stmt->rowCount() > 0;
            
        } catch(PDOException $e) {
            error_log("Database check error: " . $e->getMessage());
            return false;
        }
    }
}
?>
