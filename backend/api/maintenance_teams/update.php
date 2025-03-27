<?php
// Enable error logging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    // Include database and object files
    include_once '../config/database.php';
    include_once '../objects/maintenance_team.php';

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Initialize maintenance team object
    $team = new MaintenanceTeam($db);

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    error_log("Received update team data: " . json_encode($data));

    // Make sure data is not empty
    if(
        !empty($data->teamId) &&
        !empty($data->teamName) &&
        !empty($data->teamLeader) &&
        !empty($data->contactPhone) &&
        !empty($data->contactEmail)
    ){
        // Set team property values
        $team->TeamID = $data->teamId;
        $team->TeamName = $data->teamName;
        $team->TeamLeader = $data->teamLeader;
        $team->ContactPhone = $data->contactPhone;
        $team->ContactEmail = $data->contactEmail;
        $team->IsActive = $data->isActive ?? true;

        // Update the team
        if($team->update()){
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Team was updated successfully.",
                "data" => array(
                    "teamId" => $team->TeamID,
                    "teamName" => $team->TeamName,
                    "teamLeader" => $team->TeamLeader,
                    "contactPhone" => $team->ContactPhone,
                    "contactEmail" => $team->ContactEmail,
                    "isActive" => $team->IsActive
                )
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to update team."
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "status" => "error",
            "message" => "Unable to update team. Required data is missing.",
            "required" => ["teamId", "teamName", "teamLeader", "contactPhone", "contactEmail"],
            "received" => $data
        ));
    }
} catch(Exception $e) {
    error_log("Update team error: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error occurred: " . $e->getMessage()
    ));
}
?> 