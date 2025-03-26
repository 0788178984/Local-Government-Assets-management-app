<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Sample maintenance records with different statuses
    $records = [
        [
            'assetId' => 2,
            'teamId' => 10,
            'date' => '2025-03-26',
            'type' => 'Repair',
            'description' => 'Replace broken window',
            'cost' => 500.00,
            'status' => 'Pending',
            'provider' => 'In-House'
        ],
        [
            'assetId' => 3,
            'teamId' => 11,
            'date' => '2025-03-26',
            'type' => 'Maintenance',
            'description' => 'Air conditioning service',
            'cost' => 800.00,
            'status' => 'In Progress',
            'provider' => 'Contractor'
        ],
        [
            'assetId' => 4,
            'teamId' => 12,
            'date' => '2025-03-25',
            'type' => 'Inspection',
            'description' => 'Annual building inspection',
            'cost' => 1200.00,
            'status' => 'Completed',
            'provider' => 'External Agency'
        ],
        [
            'assetId' => 5,
            'teamId' => 10,
            'date' => '2025-03-24',
            'type' => 'Emergency Repair',
            'description' => 'Fix water leak',
            'cost' => 1500.00,
            'status' => 'Completed',
            'provider' => 'Emergency Team'
        ]
    ];

    $query = "INSERT INTO maintenancerecords 
              (AssetID, TeamID, MaintenanceDate, MaintenanceType, Description, Cost, MaintenanceStatus, MaintenanceProvider) 
              VALUES 
              (:assetId, :teamId, :date, :type, :description, :cost, :status, :provider)";
    
    $stmt = $db->prepare($query);
    $inserted = 0;
    
    foreach ($records as $record) {
        $stmt->bindParam(':assetId', $record['assetId']);
        $stmt->bindParam(':teamId', $record['teamId']);
        $stmt->bindParam(':date', $record['date']);
        $stmt->bindParam(':type', $record['type']);
        $stmt->bindParam(':description', $record['description']);
        $stmt->bindParam(':cost', $record['cost']);
        $stmt->bindParam(':status', $record['status']);
        $stmt->bindParam(':provider', $record['provider']);
        
        if ($stmt->execute()) {
            $inserted++;
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Added $inserted test maintenance records",
        "records_added" => $inserted
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
