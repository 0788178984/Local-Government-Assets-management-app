<?php
// Enable error logging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Include database and object files
    include_once '../config/database.php';
    include_once '../objects/maintenance_team.php';

    // Initialize database and team object
    $database = new Database();
    $db = $database->getConnection();

    error_log("Database connection established");

    // Test database connection
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $team = new MaintenanceTeam($db);

    // Query teams
    $stmt = $team->read();
    
    if (!$stmt) {
        throw new Exception("Failed to execute query");
    }
    
    $num = $stmt->rowCount();

    error_log("Found $num teams");

    // Check if more than 0 record found
    if($num > 0){
        // Teams array
        $teams_arr = array();
        $teams_arr["records"] = array();
        $teams_arr["activeCount"] = $team->getActiveCount();
        $teams_arr["totalCount"] = $team->getTotalCount();
        $teams_arr["status"] = "success";

        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            error_log("Processing row: " . json_encode($row));
            
            // Extract row
            extract($row);

            $team_item = array(
                "teamId" => $TeamID,
                "teamName" => $TeamName,
                "teamLeader" => $TeamLeader,
                "contactPhone" => $ContactPhone,
                "contactEmail" => $ContactEmail,
                "status" => $Status,
                "createdAt" => $CreatedAt
            );

            array_push($teams_arr["records"], $team_item);
        }

        error_log("Sending response with $teams_arr[activeCount] active teams out of $teams_arr[totalCount] total");
        error_log("Response data: " . json_encode($teams_arr));

        http_response_code(200);
        echo json_encode($teams_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "No teams found.",
            "records" => array(),
            "activeCount" => 0,
            "totalCount" => 0
        ));
    }
} catch(Exception $e) {
    error_log("Read teams error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(503);
    echo json_encode(array(
        "status" => "error",
        "message" => "Unable to read teams: " . $e->getMessage()
    ));
}
?> 