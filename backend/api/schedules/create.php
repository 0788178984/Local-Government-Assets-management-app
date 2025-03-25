<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../../config/database.php';

// Simple logging function
function logDebug($message) {
    error_log($message);
}

logDebug("Starting to process schedule creation request");

try {
    // Initialize database connection
    $database = new Database();
    $db = $database->getConnection();
    logDebug("Database connection established");

    // Get and decode the input data
    $inputJSON = file_get_contents("php://input");
    logDebug("Raw input received: " . $inputJSON);
    
    $data = json_decode($inputJSON);
    
    if (
        !empty($data->assetId) &&
        !empty($data->scheduleType) &&
        !empty($data->frequency) &&
        !empty($data->nextDueDate)
    ) {
        logDebug("All required fields are present");
        
        // Check if the table exists, if not create it
        $checkTable = "SHOW TABLES LIKE 'MaintenanceSchedules'";
        $result = $db->query($checkTable);
        
        if ($result->rowCount() == 0) {
            logDebug("MaintenanceSchedules table does not exist, creating it...");
            
            $createTable = "CREATE TABLE IF NOT EXISTS MaintenanceSchedules (
                ScheduleID INT(11) NOT NULL AUTO_INCREMENT,
                AssetID INT(11) NOT NULL,
                ScheduleType VARCHAR(50) NOT NULL,
                Frequency VARCHAR(20) NOT NULL,
                NextDueDate DATE NOT NULL,
                Description TEXT NULL,
                LastCompletedDate DATE NULL,
                PRIMARY KEY (ScheduleID),
                FOREIGN KEY (AssetID) REFERENCES Assets(AssetID) ON DELETE CASCADE
            )";
            
            $db->exec($createTable);
            logDebug("MaintenanceSchedules table created successfully");
        }
        
        // Using the exact table structure from the database schema
        $query = "INSERT INTO MaintenanceSchedules 
                  (AssetID, ScheduleType, Frequency, NextDueDate, Description, LastCompletedDate) 
                  VALUES 
                  (:assetId, :scheduleType, :frequency, :nextDueDate, :description, NULL)";
        
        logDebug("SQL Query: " . $query);
        
        $stmt = $db->prepare($query);
        
        // Bind values using the exact field names from the database schema
        $stmt->bindParam(":assetId", $data->assetId);
        $stmt->bindParam(":scheduleType", $data->scheduleType);
        $stmt->bindParam(":frequency", $data->frequency);
        $stmt->bindParam(":nextDueDate", $data->nextDueDate);
        $description = !empty($data->description) ? $data->description : "";
        $stmt->bindParam(":description", $description);
        
        logDebug("About to execute statement");
        
        if ($stmt->execute()) {
            logDebug("Statement executed successfully");
            
            // Update asset's next maintenance date
            $updateAssetQuery = "UPDATE Assets 
                               SET NextMaintenanceDate = :nextDueDate
                               WHERE AssetID = :assetId";
            
            $updateStmt = $db->prepare($updateAssetQuery);
            $updateStmt->bindParam(":nextDueDate", $data->nextDueDate);
            $updateStmt->bindParam(":assetId", $data->assetId);
            $updateStmt->execute();
            
            logDebug("Asset updated successfully");

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Maintenance schedule created successfully",
                "data" => [
                    "id" => $db->lastInsertId(),
                    "assetId" => $data->assetId,
                    "nextDueDate" => $data->nextDueDate
                ]
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            logDebug("Statement execution failed: " . print_r($errorInfo, true));
            throw new Exception("Database error: " . $errorInfo[2]);
        }
    } else {
        logDebug("Incomplete data provided: " . print_r($data, true));
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data. Required fields missing."
        ]);
    }
} catch (Exception $e) {
    logDebug("Exception caught: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>