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
        // Insert maintenance record
        $query = "INSERT INTO MaintenanceRecords 
                    SET 
                      AssetID = :assetId,
                      TeamID = :teamId,
                      MaintenanceDate = :maintenanceDate,
                      MaintenanceType = :maintenanceType,
                      Description = :description,
                      Cost = :cost,
                      MaintenanceStatus = :maintenanceStatus,
                      MaintenanceProvider = :maintenanceProvider";

        $stmt = $db->prepare($query);

        // Bind values
        $stmt->bindParam(":assetId", $data->assetId);
        $stmt->bindParam(":teamId", $data->teamId);
        $stmt->bindParam(":maintenanceDate", $data->maintenanceDate);
        $stmt->bindParam(":maintenanceType", $data->maintenanceType);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":cost", $data->cost);
        $stmt->bindParam(":maintenanceStatus", $data->maintenanceStatus);
        $stmt->bindParam(":maintenanceProvider", $data->maintenanceProvider);

        if ($stmt->execute()) {
            // Update asset's maintenance status using named parameters
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
                    "id" => $db->lastInsertId(),
                    "assetId" => $data->assetId,
                    "maintenanceDate" => $data->maintenanceDate
                ]
            ]);
        } else {
            throw new Exception("Failed to create maintenance record");
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
