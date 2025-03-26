<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get the raw input data
    $rawData = file_get_contents("php://input");
    
    // Log the raw input for debugging
    error_log("Raw maintenance update data: " . $rawData);
    
    // Decode the JSON data
    $data = json_decode($rawData);
    
    // Check if JSON was parsed correctly
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }
    
    // Log the decoded data
    error_log("Decoded maintenance data: " . print_r($data, true));
    
    if (!empty($data->maintenanceId) && !empty($data->maintenanceType)) {
        // Include MaintenanceDate in the update
        $query = "UPDATE MaintenanceRecords 
                 SET MaintenanceType = ?, 
                     Description = ?, 
                     Cost = ?, 
                     MaintenanceStatus = ?, 
                     MaintenanceProvider = ?, 
                     TeamID = ?,
                     MaintenanceDate = ?
                 WHERE MaintenanceID = ?";
        
        $stmt = $db->prepare($query);
        
        // Prepare values with proper defaults
        $maintenanceType = $data->maintenanceType;
        $description = property_exists($data, 'description') ? $data->description : '';
        $cost = property_exists($data, 'cost') ? $data->cost : 0;
        $maintenanceStatus = property_exists($data, 'maintenanceStatus') ? $data->maintenanceStatus : 'Pending';
        $maintenanceProvider = property_exists($data, 'maintenanceProvider') ? $data->maintenanceProvider : '';
        $teamId = property_exists($data, 'teamId') ? $data->teamId : null;
        $maintenanceDate = property_exists($data, 'maintenanceDate') ? $data->maintenanceDate : date('Y-m-d');
        $maintenanceId = $data->maintenanceId;
        
        // Log the values being used in the query
        error_log("Update values: Type=$maintenanceType, Desc=$description, Cost=$cost, Status=$maintenanceStatus, Provider=$maintenanceProvider, TeamID=$teamId, Date=$maintenanceDate, ID=$maintenanceId");
        
        $result = $stmt->execute([
            $maintenanceType,
            $description,
            $cost,
            $maintenanceStatus,
            $maintenanceProvider,
            $teamId,
            $maintenanceDate,
            $maintenanceId
        ]);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Maintenance record updated successfully"
            ]);
        } else {
            // Log the error details
            error_log("Database error: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Failed to update maintenance record: " . implode(", ", $stmt->errorInfo()));
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data: maintenanceId and maintenanceType are required"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log("Maintenance update error: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>