<?php
// Enable error reporting
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Function to output JSON response and exit
function output_json($status, $message) {
    echo json_encode(array(
        "status" => $status,
        "message" => $message
    ));
    exit;
}

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    output_json("success", "Preflight request successful");
}

// Log request information
error_log("Delete Simple - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Delete Simple - GET: " . json_encode($_GET));
error_log("Delete Simple - POST: " . json_encode($_POST));

// Get ID from various sources
$id = null;

// Check GET parameters
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    error_log("Delete Simple - Found ID in GET: " . $id);
}

// Check POST parameters
else if (isset($_POST['id'])) {
    $id = $_POST['id'];
    error_log("Delete Simple - Found ID in POST: " . $id);
}

// Check JSON input
else {
    $raw_input = file_get_contents("php://input");
    error_log("Delete Simple - Raw input: " . $raw_input);
    
    if (!empty($raw_input)) {
        $data = json_decode($raw_input, true);
        if (is_array($data) && isset($data['id'])) {
            $id = $data['id'];
            error_log("Delete Simple - Found ID in JSON: " . $id);
        }
    }
}

// Validate ID
if (!$id) {
    http_response_code(400);
    output_json("error", "Team ID is required");
}

try {
    // Include database
    include_once '../config/database.php';
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Simple query
    $query = "DELETE FROM maintenance_teams WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$id]);
    
    // Check if any rows were affected
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        output_json("success", "Team with ID " . $id . " was deleted successfully");
    } else {
        http_response_code(404);
        output_json("error", "Team with ID " . $id . " not found");
    }
} catch (PDOException $e) {
    error_log("Delete Simple - Database error: " . $e->getMessage());
    http_response_code(500);
    output_json("error", "Database error: " . $e->getMessage());
} catch (Exception $e) {
    error_log("Delete Simple - General error: " . $e->getMessage());
    http_response_code(500);
    output_json("error", "Server error: " . $e->getMessage());
}

// Fallback response (should never reach here)
http_response_code(500);
output_json("error", "Unknown error occurred");
?> 