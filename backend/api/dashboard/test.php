<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Include database configuration with correct path
    require_once dirname(__DIR__) . '/../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    // Count maintenance records from both possible tables
    $query = "(SELECT COUNT(*) as count FROM maintenance_records)
              UNION ALL
              (SELECT COUNT(*) as count FROM maintenancerecords)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Sum up the counts from both tables
    $total_count = 0;
    foreach ($results as $result) {
        $total_count += (int)$result['count'];
    }
    
    // Return maintenance records count
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Maintenance records count",
        "data" => ["count" => $total_count]
    ]);

} catch (PDOException $e) {
    error_log("Database error in test.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Server error in test.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>
