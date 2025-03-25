<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->maintenanceId) && !empty($data->maintenanceType)) {
        $query = "UPDATE MaintenanceRecords 
                 SET MaintenanceType = ?, Description = ?, Cost = ?, 
                     MaintenanceStatus = ?, MaintenanceProvider = ?, 
                     TeamID = ? 
                 WHERE MaintenanceID = ?";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            $data->maintenanceType,
            $data->description,
            $data->cost,
            $data->maintenanceStatus,
            $data->maintenanceProvider,
            $data->teamId,
            $data->maintenanceId
        ]);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Maintenance record updated successfully"
            ]);
        } else {
            throw new Exception("Failed to update maintenance record");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?> 