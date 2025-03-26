<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Drop and recreate the table to ensure correct structure
    $dropTable = "DROP TABLE IF EXISTS maintenancerecords";
    $db->exec($dropTable);

    // Create table with correct structure
    $createTable = "CREATE TABLE IF NOT EXISTS maintenancerecords (
        MaintenanceID INT(11) NOT NULL AUTO_INCREMENT,
        AssetID INT(11) NOT NULL,
        TeamID INT(11),
        MaintenanceDate DATE NOT NULL,
        MaintenanceType VARCHAR(50) NOT NULL,
        Description TEXT,
        MaintenanceStatus VARCHAR(20) NOT NULL,
        MaintenanceProvider VARCHAR(50),
        Cost DECIMAL(10,2),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (MaintenanceID)
    )";
    
    $db->exec($createTable);

    // Sample maintenance records
    $records = [
        [
            'assetId' => 2,
            'teamId' => 1,
            'date' => '2025-03-20',
            'type' => 'Regular Inspection',
            'description' => 'Monthly bicycle inspection completed',
            'status' => 'Completed',
            'provider' => 'Internal Team',
            'cost' => 50.00
        ],
        [
            'assetId' => 3,
            'teamId' => 2,
            'date' => '2025-03-25',
            'type' => 'Preventive Maintenance',
            'description' => 'Quarterly motorcycle service in progress',
            'status' => 'In Progress',
            'provider' => 'External Contractor',
            'cost' => 150.00
        ],
        [
            'assetId' => 4,
            'teamId' => 1,
            'date' => '2025-04-01',
            'type' => 'Safety Check',
            'description' => 'Weekly generator safety inspection pending',
            'status' => 'Pending',
            'provider' => 'Internal Team',
            'cost' => 75.00
        ],
        [
            'assetId' => 5,
            'teamId' => 3,
            'date' => '2025-04-05',
            'type' => 'Routine Maintenance',
            'description' => 'Monthly HVAC maintenance pending',
            'status' => 'Pending',
            'provider' => 'HVAC Specialists',
            'cost' => 200.00
        ],
        [
            'assetId' => 8,
            'teamId' => 1,
            'date' => '2025-04-02',
            'type' => 'Emergency Test',
            'description' => 'Weekly emergency generator test pending',
            'status' => 'Pending',
            'provider' => 'Internal Team',
            'cost' => 100.00
        ],
        [
            'assetId' => 2,
            'teamId' => 2,
            'date' => '2025-03-15',
            'type' => 'Repair',
            'description' => 'Bicycle chain replacement completed',
            'status' => 'Completed',
            'provider' => 'Bike Shop',
            'cost' => 45.00
        ],
        [
            'assetId' => 4,
            'teamId' => 1,
            'date' => '2025-04-10',
            'type' => 'Oil Change',
            'description' => 'Monthly generator oil change pending',
            'status' => 'Pending',
            'provider' => 'Internal Team',
            'cost' => 120.00
        ],
        [
            'assetId' => 8,
            'teamId' => 3,
            'date' => '2025-04-15',
            'type' => 'Battery Check',
            'description' => 'Monthly emergency generator battery test pending',
            'status' => 'Pending',
            'provider' => 'Battery Specialist',
            'cost' => 80.00
        ]
    ];

    $query = "INSERT INTO maintenancerecords 
              (AssetID, TeamID, MaintenanceDate, MaintenanceType, Description, MaintenanceStatus, MaintenanceProvider, Cost) 
              VALUES 
              (:assetId, :teamId, :date, :type, :description, :status, :provider, :cost)";
    
    $stmt = $db->prepare($query);
    $inserted = 0;
    
    foreach ($records as $record) {
        $stmt->bindParam(':assetId', $record['assetId']);
        $stmt->bindParam(':teamId', $record['teamId']);
        $stmt->bindParam(':date', $record['date']);
        $stmt->bindParam(':type', $record['type']);
        $stmt->bindParam(':description', $record['description']);
        $stmt->bindParam(':status', $record['status']);
        $stmt->bindParam(':provider', $record['provider']);
        $stmt->bindParam(':cost', $record['cost']);
        
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
