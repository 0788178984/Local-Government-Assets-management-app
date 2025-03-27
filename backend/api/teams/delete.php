<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
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
error_log("Delete team request received. Method: " . $_SERVER['REQUEST_METHOD']);

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Prepare team object
    $team = new Team($db);
    
    // Get team ID
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->TeamID)) {
        // From JSON body (POST)
        $teamId = $data->TeamID;
        error_log("Team ID from POST JSON: " . $teamId);
    } else if (isset($_GET['id'])) {
        // From query string (GET)
        $teamId = $_GET['id'];
        error_log("Team ID from GET: " . $teamId);
    } else {
        throw new Exception("No team ID provided");
    }
    
    // Set team ID to delete
    $team->TeamID = $teamId;
    
    // Delete the team
    if ($team->delete()) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Team deleted successfully"
        ]);
    } else {
        throw new Exception("Failed to delete team");
    }
} catch (Exception $e) {
    error_log("Delete team error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>