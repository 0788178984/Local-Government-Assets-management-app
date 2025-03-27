<?php
class MaintenanceTeam {
    // Database connection and table name
    private $conn;
    private $table_name = "maintenance_teams";  // Using the correct table name with underscore

    // Object properties matching exact schema
    public $TeamID;
    public $TeamName;
    public $TeamLeader;
    public $ContactPhone;
    public $ContactEmail;
    public $Status;
    public $CreatedAt;

    // Constructor
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create team
    public function create() {
        try {
            error_log("Creating new team: " . json_encode([
                'name' => $this->TeamName,
                'leader' => $this->TeamLeader,
                'phone' => $this->ContactPhone,
                'email' => $this->ContactEmail
            ]));

            $query = "INSERT INTO " . $this->table_name . "
                    (TeamName, TeamLeader, ContactPhone, ContactEmail, Status)
                    VALUES
                    (:name, :leader, :phone, :email, 'Active')";

            $stmt = $this->conn->prepare($query);

            // Sanitize and bind
            $stmt->bindParam(":name", htmlspecialchars(strip_tags($this->TeamName)));
            $stmt->bindParam(":leader", htmlspecialchars(strip_tags($this->TeamLeader)));
            $stmt->bindParam(":phone", htmlspecialchars(strip_tags($this->ContactPhone)));
            $stmt->bindParam(":email", htmlspecialchars(strip_tags($this->ContactEmail)));

            if($stmt->execute()) {
                $this->TeamID = $this->conn->lastInsertId();
                error_log("Team created successfully with ID: " . $this->TeamID);
                return true;
            }

            error_log("Failed to create team");
            return false;
        } catch(PDOException $e) {
            error_log("Create Team Error: " . $e->getMessage());
            throw $e;
        }
    }

    // Read all teams
    public function read() {
        try {
            error_log("Reading all teams");
            
            $query = "SELECT
                        TeamID, TeamName, TeamLeader, ContactPhone, 
                        ContactEmail, Status, CreatedAt
                    FROM " . $this->table_name . "
                    ORDER BY CreatedAt DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            error_log("Found " . $stmt->rowCount() . " teams");
            return $stmt;
        } catch(PDOException $e) {
            error_log("Read Teams Error: " . $e->getMessage());
            throw $e;
        }
    }

    // Read single team
    public function readOne() {
        try {
            error_log("Reading team with ID: " . $this->TeamID);
            
            $query = "SELECT
                        TeamID, TeamName, TeamLeader, ContactPhone,
                        ContactEmail, Status, CreatedAt
                    FROM " . $this->table_name . "
                    WHERE TeamID = ?
                    LIMIT 0,1";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->TeamID);
            $stmt->execute();

            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $this->TeamName = $row['TeamName'];
                $this->TeamLeader = $row['TeamLeader'];
                $this->ContactPhone = $row['ContactPhone'];
                $this->ContactEmail = $row['ContactEmail'];
                $this->Status = $row['Status'];
                $this->CreatedAt = $row['CreatedAt'];
                
                error_log("Team found: " . json_encode($row));
                return true;
            }
            
            error_log("No team found with ID: " . $this->TeamID);
            return false;
        } catch(PDOException $e) {
            error_log("Read One Team Error: " . $e->getMessage());
            throw $e;
        }
    }

    // Update team
    public function update() {
        try {
            error_log("Updating team with ID: " . $this->TeamID);
            
            $query = "UPDATE " . $this->table_name . "
                    SET
                        TeamName = :name,
                        TeamLeader = :leader,
                        ContactPhone = :phone,
                        ContactEmail = :email,
                        Status = :status
                    WHERE
                        TeamID = :id";

            $stmt = $this->conn->prepare($query);

            // Sanitize and bind
            $stmt->bindParam(":name", htmlspecialchars(strip_tags($this->TeamName)));
            $stmt->bindParam(":leader", htmlspecialchars(strip_tags($this->TeamLeader)));
            $stmt->bindParam(":phone", htmlspecialchars(strip_tags($this->ContactPhone)));
            $stmt->bindParam(":email", htmlspecialchars(strip_tags($this->ContactEmail)));
            $stmt->bindParam(":status", $this->Status);
            $stmt->bindParam(":id", $this->TeamID);

            if($stmt->execute()) {
                error_log("Team updated successfully");
                return true;
            }

            error_log("Failed to update team");
            return false;
        } catch(PDOException $e) {
            error_log("Update Team Error: " . $e->getMessage());
            throw $e;
        }
    }

    // Delete team (soft delete by setting Status to Inactive)
    public function delete() {
        try {
            error_log("Attempting to delete team with ID: " . $this->TeamID);

            // First check if team exists
            $check_query = "SELECT TeamID FROM " . $this->table_name . " WHERE TeamID = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(1, $this->TeamID);
            $check_stmt->execute();

            if($check_stmt->rowCount() == 0) {
                error_log("Team not found with ID: " . $this->TeamID);
                return false;
            }

            // Soft delete by updating Status
            $query = "UPDATE " . $this->table_name . "
                     SET Status = 'Inactive'
                     WHERE TeamID = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->TeamID);

            if($stmt->execute()) {
                error_log("Team deleted (set to inactive) successfully");
                return true;
            }

            error_log("Failed to delete team");
            return false;
        } catch(PDOException $e) {
            error_log("Delete Team Error: " . $e->getMessage());
            throw $e;
        }
    }

    // Get active teams count
    public function getActiveCount() {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE Status = 'Active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = (int)$row['count'];
            error_log("Active teams count: " . $count);
            return $count;
        } catch(PDOException $e) {
            error_log("Get active count error: " . $e->getMessage());
            throw $e;
        }
    }

    // Get total teams count
    public function getTotalCount() {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = (int)$row['count'];
            error_log("Total teams count: " . $count);
            return $count;
        } catch(PDOException $e) {
            error_log("Get total count error: " . $e->getMessage());
            throw $e;
        }
    }
}
?> 