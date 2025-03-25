<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database and team object
include_once '../../config/database.php';
include_once '../objects/team.php';

// Debug information
error_log("Update team request received. Method: " . $_SERVER['REQUEST_METHOD']);

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Prepare team object
    $team = new Team($db);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    error_log("Update team data received: " . json_encode($data));
    
    if (!empty($data->TeamID) && !empty($data->TeamName) && !empty($data->TeamLeader)) {
        // Set team property values
        $team->TeamID = $data->TeamID;
        $team->TeamName = $data->TeamName;
        $team->TeamLeader = $data->TeamLeader;
        $team->ContactPhone = $data->ContactPhone;
        $team->ContactEmail = $data->ContactEmail;
        $team->IsActive = $data->IsActive;
        
        // Update the team
        if ($team->update()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Team updated successfully"
            ]);
        } else {
            throw new Exception("Failed to update team");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data. Required fields: TeamID, TeamName, TeamLeader"
        ]);
    }
} catch (Exception $e) {
    error_log("Update team error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>