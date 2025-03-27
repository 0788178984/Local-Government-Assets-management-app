<?php
// Enable error logging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Include database and object files
    include_once '../config/database.php';
    include_once '../objects/maintenance_team.php';

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Initialize maintenance team object
    $team = new MaintenanceTeam($db);

    // Get team ID
    $data = json_decode(file_get_contents("php://input"));
    
    // First try to get ID from POST data
    if (!empty($data->teamId)) {
        $team->TeamID = $data->teamId;
    }
    // Then try GET parameter
    else if (!empty($_GET['id'])) {
        $team->TeamID = $_GET['id'];
    }
    // Finally try POST parameter
    else if (!empty($_POST['id'])) {
        $team->TeamID = $_POST['id'];
    }

    error_log("Attempting to delete team with ID: " . $team->TeamID);

    // Check if ID is set
    if(empty($team->TeamID)){
        http_response_code(400);
        echo json_encode(array(
            "status" => "error",
            "message" => "Unable to delete team. No ID provided."
        ));
        exit;
    }

    // Delete the team
    if($team->delete()){
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Team was deleted (deactivated) successfully.",
            "id" => $team->TeamID
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "status" => "error",
            "message" => "Unable to delete team."
        ));
    }
} catch(Exception $e) {
    error_log("Delete team error: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error occurred: " . $e->getMessage()
    ));
}
?> 