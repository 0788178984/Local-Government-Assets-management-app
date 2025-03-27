<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once '../../config/database.php';

// Simple logging function
function logDebug($message) {
    error_log($message);
}

logDebug("Starting to process schedule read request");

try {
    $database = new Database();
    $db = $database->getConnection();
    logDebug("Database connection established");

    // Query that matches the actual maintenanceschedules table structure
    $query = "SELECT 
        ms.ScheduleID,
        ms.AssetID,
        a.AssetName,
        a.Location as AssetLocation,
        ms.ScheduleType,
        ms.Frequency,
        ms.NextDueDate,
        ms.Description,
        ms.LastCompletedDate
    FROM maintenanceschedules ms
    LEFT JOIN assets a ON ms.AssetID = a.AssetID
    ORDER BY ms.NextDueDate ASC";

    logDebug("Executing query: " . $query);
    $stmt = $db->prepare($query);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $schedules = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($schedules, $row);
        }

        logDebug("Found " . count($schedules) . " schedules");
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Schedules found",
            "data" => $schedules
        ));
    } else {
        logDebug("No schedules found");
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "No schedules found",
            "data" => []
        ));
    }
} catch(PDOException $e) {
    logDebug("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ));
} catch(Exception $e) {
    logDebug("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ));
}
?>