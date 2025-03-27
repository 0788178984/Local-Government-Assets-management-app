<?php
class Team {
    // Database connection and table name
    private $conn;
    private $table_name = "MaintenanceTeams";

    // Object properties
    public $TeamID;
    public $TeamName;
    public $TeamLeader;
    public $ContactPhone;
    public $ContactEmail;
    public $IsActive;
    public $CreatedAt;

    // Constructor
    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all teams
    public function readAll() {
        try {
            $query = "SELECT 
                        TeamID, TeamName, TeamLeader, ContactPhone, 
                        ContactEmail, IsActive, CreatedAt
                      FROM " . $this->table_name . "
                      ORDER BY TeamName";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Read Teams Error: " . $e->getMessage());
            return false;
        }
    }

    // Read single team
    public function readOne() {
        try {
            $query = "SELECT
                        TeamID, TeamName, TeamLeader, ContactPhone,
                        ContactEmail, IsActive, CreatedAt
                      FROM " . $this->table_name . "
                      WHERE TeamID = ?
                      LIMIT 0,1";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->TeamID);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($row) {
                $this->TeamName = $row['TeamName'];
                $this->TeamLeader = $row['TeamLeader'];
                $this->ContactPhone = $row['ContactPhone'];
                $this->ContactEmail = $row['ContactEmail'];
                $this->IsActive = $row['IsActive'];
                $this->CreatedAt = $row['CreatedAt'];
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            error_log("Read One Team Error: " . $e->getMessage());
            return false;
        }
    }

    // Get active teams count
    public function getActiveCount() {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE IsActive = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$row['count'];
        } catch(PDOException $e) {
            error_log("Get active count error: " . $e->getMessage());
            return 0;
        }
    }

    // Get total teams count
    public function getTotalCount() {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$row['count'];
        } catch(PDOException $e) {
            error_log("Get total count error: " . $e->getMessage());
            return 0;
        }
    }
    
    // Create team
    public function create() {
        try {
            // Query to insert record
            $query = "INSERT INTO " . $this->table_name . "
                      (TeamName, TeamLeader, ContactPhone, ContactEmail, IsActive)
                      VALUES (?, ?, ?, ?, ?)";
            
            // Prepare query
            $stmt = $this->conn->prepare($query);
            
            // Sanitize input
            $this->TeamName = htmlspecialchars(strip_tags($this->TeamName));
            $this->TeamLeader = htmlspecialchars(strip_tags($this->TeamLeader));
            $this->ContactPhone = htmlspecialchars(strip_tags($this->ContactPhone));
            $this->ContactEmail = htmlspecialchars(strip_tags($this->ContactEmail));
            $this->IsActive = $this->IsActive ? 1 : 0;
            
            // Bind values
            $stmt->bindParam(1, $this->TeamName);
            $stmt->bindParam(2, $this->TeamLeader);
            $stmt->bindParam(3, $this->ContactPhone);
            $stmt->bindParam(4, $this->ContactEmail);
            $stmt->bindParam(5, $this->IsActive);
            
            // Execute query
            if($stmt->execute()) {
                $this->TeamID = $this->conn->lastInsertId();
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            error_log("Create Team Error: " . $e->getMessage());
            return false;
        }
    }
    
    // Update team
    public function update() {
        try {
            // Query to update record
            $query = "UPDATE " . $this->table_name . "
                      SET TeamName = ?,
                          TeamLeader = ?,
                          ContactPhone = ?,
                          ContactEmail = ?,
                          IsActive = ?
                      WHERE TeamID = ?";
            
            // Prepare query
            $stmt = $this->conn->prepare($query);
            
            // Sanitize input
            $this->TeamName = htmlspecialchars(strip_tags($this->TeamName));
            $this->TeamLeader = htmlspecialchars(strip_tags($this->TeamLeader));
            $this->ContactPhone = htmlspecialchars(strip_tags($this->ContactPhone));
            $this->ContactEmail = htmlspecialchars(strip_tags($this->ContactEmail));
            $this->IsActive = $this->IsActive ? 1 : 0;
            $this->TeamID = htmlspecialchars(strip_tags($this->TeamID));
            
            // Bind values
            $stmt->bindParam(1, $this->TeamName);
            $stmt->bindParam(2, $this->TeamLeader);
            $stmt->bindParam(3, $this->ContactPhone);
            $stmt->bindParam(4, $this->ContactEmail);
            $stmt->bindParam(5, $this->IsActive);
            $stmt->bindParam(6, $this->TeamID);
            
            // Execute query
            if($stmt->execute()) {
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            error_log("Update Team Error: " . $e->getMessage());
            return false;
        }
    }
    
    // Delete team
    public function delete() {
        try {
            // Query to delete record
            $query = "DELETE FROM " . $this->table_name . " WHERE TeamID = ?";
            
            // Prepare query
            $stmt = $this->conn->prepare($query);
            
            // Sanitize input
            $this->TeamID = htmlspecialchars(strip_tags($this->TeamID));
            
            // Bind value
            $stmt->bindParam(1, $this->TeamID);
            
            // Execute query
            if($stmt->execute()) {
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            error_log("Delete Team Error: " . $e->getMessage());
            return false;
        }
    }
    
    // Search teams
    public function search($keywords) {
        try {
            // Query to search records
            $query = "SELECT 
                        TeamID, TeamName, TeamLeader, ContactPhone, 
                        ContactEmail, IsActive, CreatedAt
                      FROM " . $this->table_name . "
                      WHERE TeamName LIKE ? OR TeamLeader LIKE ?
                      ORDER BY TeamName";
            
            // Prepare query
            $stmt = $this->conn->prepare($query);
            
            // Sanitize input
            $keywords = htmlspecialchars(strip_tags($keywords));
            $keywords = "%{$keywords}%";
            
            // Bind values
            $stmt->bindParam(1, $keywords);
            $stmt->bindParam(2, $keywords);
            
            // Execute query
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Search Teams Error: " . $e->getMessage());
            return false;
        }
    }
}
?>
