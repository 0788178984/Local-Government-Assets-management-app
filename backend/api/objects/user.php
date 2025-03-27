<?php
class User {
    private $conn;
    private $table_name = "users"; // Changed to lowercase to match actual table name

    // Object properties exactly matching the database columns
    public $UserID;
    public $Username;
    public $Password;
    public $UserRole;
    public $Email;
    public $GoogleID;
    public $CreatedAt;
    public $LastLogin;
    public $IsActive;
    public $AuthProvider;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function emailExists() {
        try {
            $query = "SELECT 
                        UserID, 
                        Username, 
                        Password, 
                        UserRole,
                        Email,
                        GoogleID,
                        CreatedAt,
                        LastLogin,
                        IsActive,
                        AuthProvider
                    FROM " . $this->table_name . " 
                    WHERE Email = ?";

            error_log("Executing query: " . $query . " with email: " . $this->Email);
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->Email);
            $stmt->execute();

            $rowCount = $stmt->rowCount();
            error_log("Query returned " . $rowCount . " rows");

            if ($rowCount > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                error_log("Found user data: " . print_r($row, true));
                
                // Map database fields to object properties
                $this->UserID = $row['UserID'];
                $this->Username = $row['Username'];
                $this->Password = $row['Password'];
                $this->UserRole = $row['UserRole'];
                $this->Email = $row['Email'];
                $this->GoogleID = $row['GoogleID'];
                $this->CreatedAt = $row['CreatedAt'];
                $this->LastLogin = $row['LastLogin'];
                $this->IsActive = $row['IsActive'];
                $this->AuthProvider = $row['AuthProvider'];

                error_log("Mapped user data: " . print_r($this, true));
                return true;
            }
            error_log("No user found with email: " . $this->Email);
            return false;
        } catch (PDOException $e) {
            error_log("Database error in emailExists: " . $e->getMessage());
            throw new Exception("Database error occurred");
        }
    }

    public function updateLastLogin() {
        try {
            // If UserID is set in the object, use it
            if (isset($this->UserID)) {
                return $this->updateLastLoginById($this->UserID);
            }
            return false;
        } catch (Exception $e) {
            error_log("updateLastLogin error: " . $e->getMessage());
            return false;
        }
    }

    public function create() {
        try {
            // Add debug logging
            error_log("Creating user: " . $this->Username . ", Email: " . $this->Email . ", Role: " . $this->UserRole);
            
            $query = "INSERT INTO " . $this->table_name . "
                    (Username, Email, Password, UserRole, AuthProvider, IsActive)
                    VALUES
                    (:username, :email, :password, :userRole, 'Local', 1)";

            $stmt = $this->conn->prepare($query);

            // Sanitize input
            $this->Username = htmlspecialchars(strip_tags($this->Username));
            $this->Email = htmlspecialchars(strip_tags($this->Email));
            $this->Password = htmlspecialchars(strip_tags($this->Password));
            $this->UserRole = htmlspecialchars(strip_tags($this->UserRole));

            error_log("After sanitization - Username: " . $this->Username . ", Email: " . $this->Email . ", Role: " . $this->UserRole);

            // Hash the password
            $password_hash = password_hash($this->Password, PASSWORD_BCRYPT);
            error_log("Password hash generated: " . $password_hash);

            // Bind values
            $stmt->bindParam(":username", $this->Username);
            $stmt->bindParam(":email", $this->Email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":userRole", $this->UserRole);

            $result = $stmt->execute();
            error_log("User creation result: " . ($result ? "success" : "failed"));
            return $result;
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            throw new Exception("Failed to create user");
        }
    }

    public function getUserByUsername() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE Username = :username LIMIT 1";
            $stmt = $this->conn->prepare($query);
            
            // Sanitize input
            $this->Username = htmlspecialchars(strip_tags($this->Username));
            
            // Bind parameters
            $stmt->bindParam(':username', $this->Username);
            
            // Execute query
            if (!$stmt->execute()) {
                error_log("getUserByUsername execute failed: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            return $stmt;
        } catch (Exception $e) {
            error_log("getUserByUsername error: " . $e->getMessage());
            return false;
        }
    }

    public function updateTokens($userId, $token, $refreshToken, $tokenExpiry, $refreshTokenExpiry) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET Token = :token,
                          RefreshToken = :refresh_token,
                          TokenExpiry = :token_expiry,
                          RefreshTokenExpiry = :refresh_token_expiry
                      WHERE UserID = :user_id";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':refresh_token', $refreshToken);
            $stmt->bindParam(':token_expiry', $tokenExpiry);
            $stmt->bindParam(':refresh_token_expiry', $refreshTokenExpiry);
            $stmt->bindParam(':user_id', $userId);
            
            if (!$stmt->execute()) {
                error_log("updateTokens execute failed: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            error_log("updateTokens error: " . $e->getMessage());
            return false;
        }
    }

    public function updateLastLoginById($userId) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET LastLogin = NOW()
                      WHERE UserID = :user_id";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameter
            $stmt->bindParam(':user_id', $userId);
            
            if (!$stmt->execute()) {
                error_log("updateLastLogin execute failed: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            error_log("updateLastLogin error: " . $e->getMessage());
            return false;
        }
    }

    // Get user by refresh token
    public function getUserByRefreshToken($refreshToken) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " 
                      WHERE RefreshToken = :refresh_token 
                      AND RefreshTokenExpiry > NOW() 
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':refresh_token', $refreshToken);
            
            if (!$stmt->execute()) {
                error_log("getUserByRefreshToken execute failed: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            return $stmt;
        } catch (Exception $e) {
            error_log("getUserByRefreshToken error: " . $e->getMessage());
            return false;
        }
    }
}
?> 