<?php
// Enable error logging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../config/database.php';
include_once '../objects/maintenance_team.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Initialize maintenance team object
    $team = new MaintenanceTeam($db);

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    error_log("Received create team data: " . json_encode($data));

    // Make sure data is not empty
    if(
        !empty($data->teamName) &&
        !empty($data->teamLeader) &&
        !empty($data->contactPhone) &&
        !empty($data->contactEmail)
    ){
        // Set team property values
        $team->TeamName = $data->teamName;
        $team->TeamLeader = $data->teamLeader;
        $team->ContactPhone = $data->contactPhone;
        $team->ContactEmail = $data->contactEmail;

        // Create the team
        if($team->create()){
            http_response_code(201);
            echo json_encode(array(
                "status" => "success",
                "message" => "Team was created successfully.",
                "data" => array(
                    "id" => $team->TeamID,
                    "teamName" => $team->TeamName,
                    "teamLeader" => $team->TeamLeader,
                    "contactPhone" => $team->ContactPhone,
                    "contactEmail" => $team->ContactEmail,
                    "isActive" => true
                )
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to create team."
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "status" => "error",
            "message" => "Unable to create team. Required data is missing.",
            "required" => ["teamName", "teamLeader", "contactPhone", "contactEmail"],
            "received" => $data
        ));
    }
} catch (Exception $e) {
    error_log("Create team error: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error occurred: " . $e->getMessage()
    ));
}
?> 