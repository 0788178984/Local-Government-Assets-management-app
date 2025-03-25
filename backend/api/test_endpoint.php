<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
include_once './config/database.php';

$response = array(
    "status" => "success",
    "message" => "API connection successful",
    "timestamp" => date("Y-m-d H:i:s"),
    "server_info" => array(
        "ip" => $_SERVER['SERVER_ADDR'] ?? 'unknown',
        "host" => $_SERVER['HTTP_HOST'] ?? 'unknown',
        "software" => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        "request_method" => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
    )
);

// Try to connect to the database
try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test if we can query the MaintenanceSchedules table
    $query = "SHOW TABLES LIKE 'MaintenanceSchedules'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $response["database"] = array(
            "connection" => "successful",
            "tables" => array()
        );
        
        // Check MaintenanceSchedules table structure
        $query = "DESCRIBE MaintenanceSchedules";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $columns = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = array(
                "field" => $row["Field"],
                "type" => $row["Type"],
                "null" => $row["Null"],
                "key" => $row["Key"],
                "default" => $row["Default"]
            );
        }
        
        $response["database"]["tables"]["MaintenanceSchedules"] = array(
            "exists" => true,
            "columns" => $columns
        );
        
        // Check if Assets table exists
        $query = "SHOW TABLES LIKE 'Assets'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $response["database"]["tables"]["Assets"] = array(
                "exists" => true
            );
            
            // Count assets
            $query = "SELECT COUNT(*) as count FROM Assets";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $response["database"]["tables"]["Assets"]["count"] = $row["count"];
        } else {
            $response["database"]["tables"]["Assets"] = array(
                "exists" => false
            );
        }
    } else {
        $response["database"] = array(
            "connection" => "successful",
            "tables" => array(
                "MaintenanceSchedules" => array(
                    "exists" => false
                )
            )
        );
    }
} catch (PDOException $e) {
    $response["status"] = "error";
    $response["message"] = "Database connection failed";
    $response["error"] = $e->getMessage();
}

// Return the JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
?>
