<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Check if table exists, if not create it
    $checkTable = "SHOW TABLES LIKE 'MaintenanceRecords'";
    $result = $db->query($checkTable);
    
    if ($result->rowCount() == 0) {
        $createTable = "CREATE TABLE IF NOT EXISTS MaintenanceRecords (
            MaintenanceID INT(11) NOT NULL AUTO_INCREMENT,
            AssetID INT(11) NOT NULL,
            TeamID INT(11) NOT NULL,
            MaintenanceDate DATE NOT NULL,
            MaintenanceType VARCHAR(50) NOT NULL,
            Description TEXT NOT NULL,
            Cost DECIMAL(10,2) NOT NULL,
            MaintenanceStatus VARCHAR(20) DEFAULT 'Pending',
            MaintenanceProvider VARCHAR(100),
            PRIMARY KEY (MaintenanceID),
            FOREIGN KEY (AssetID) REFERENCES Assets(AssetID) ON DELETE CASCADE,
            FOREIGN KEY (TeamID) REFERENCES MaintenanceTeams(TeamID) ON DELETE CASCADE
        )";
        
        $db->exec($createTable);
        error_log("MaintenanceRecords table created successfully");
    }

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    // Log received data for debugging
    error_log("Received data: " . print_r($data, true));

    // Validate required fields
    if (
        !empty($data->assetId) &&
        !empty($data->teamId) &&
        !empty($data->maintenanceDate) &&
        !empty($data->maintenanceType) &&
        !empty($data->description) &&
        !empty($data->cost)
    ) {
        // Set default values for optional fields
        $maintenanceStatus = !empty($data->maintenanceStatus) ? $data->maintenanceStatus : 'Pending';
        $maintenanceProvider = !empty($data->maintenanceProvider) ? $data->maintenanceProvider : '';

        // Insert maintenance record
        $query = "INSERT INTO MaintenanceRecords 
                    (AssetID, TeamID, MaintenanceDate, MaintenanceType, Description, 
                     Cost, MaintenanceStatus, MaintenanceProvider)
                 VALUES 
                    (:assetId, :teamId, :maintenanceDate, :maintenanceType, :description,
                     :cost, :maintenanceStatus, :maintenanceProvider)";

        $stmt = $db->prepare($query);

        // Bind values
        $stmt->bindParam(":assetId", $data->assetId);
        $stmt->bindParam(":teamId", $data->teamId);
        $stmt->bindParam(":maintenanceDate", $data->maintenanceDate);
        $stmt->bindParam(":maintenanceType", $data->maintenanceType);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":cost", $data->cost);
        $stmt->bindParam(":maintenanceStatus", $maintenanceStatus);
        $stmt->bindParam(":maintenanceProvider", $maintenanceProvider);

        if ($stmt->execute()) {
            $newId = $db->lastInsertId();
            error_log("New maintenance record ID: " . $newId);

            // Update asset's maintenance status
            $updateAssetQuery = "UPDATE Assets 
                               SET LastMaintenanceDate = :maintenanceDate,
                                   MaintenanceStatus = :status
                               WHERE AssetID = :assetId";
            
            $updateStmt = $db->prepare($updateAssetQuery);
            $status = 'Good';
            
            $updateStmt->bindParam(":maintenanceDate", $data->maintenanceDate);
            $updateStmt->bindParam(":status", $status);
            $updateStmt->bindParam(":assetId", $data->assetId);
            $updateStmt->execute();

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Maintenance record created successfully",
                "data" => [
                    "id" => $newId,
                    "assetId" => $data->assetId,
                    "maintenanceDate" => $data->maintenanceDate
                ]
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("Database error: " . print_r($errorInfo, true));
            throw new Exception("Failed to create maintenance record: " . $errorInfo[2]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data. Required fields missing."
        ]);
    }
} catch (Exception $e) {
    error_log("Error creating maintenance record: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>
