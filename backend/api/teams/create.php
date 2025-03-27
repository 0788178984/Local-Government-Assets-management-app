<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->teamName) && !empty($data->teamLeader) && 
        !empty($data->contactPhone) && !empty($data->contactEmail)) {
        
        $query = "INSERT INTO MaintenanceTeams 
                 (TeamName, TeamLeader, ContactPhone, ContactEmail, IsActive) 
                 VALUES (?, ?, ?, ?, TRUE)";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            $data->teamName,
            $data->teamLeader,
            $data->contactPhone,
            $data->contactEmail
        ]);
        
        if ($result) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Maintenance team created successfully"
            ]);
        } else {
            throw new Exception("Failed to create team");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data. All fields are required."
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