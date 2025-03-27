<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Drop the existing table to recreate with correct structure
    $dropTable = "DROP TABLE IF EXISTS maintenanceschedules";
    $db->exec($dropTable);

    // Create table with correct structure
    $createTable = "CREATE TABLE IF NOT EXISTS maintenanceschedules (
        ScheduleID INT(11) NOT NULL AUTO_INCREMENT,
        AssetID INT(11) NOT NULL,
        ScheduleType VARCHAR(50) NOT NULL,
        Description TEXT,
        Frequency VARCHAR(20) NOT NULL,
        NextDueDate DATE NOT NULL,
        LastCompletedDate DATE NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ScheduleID)
    )";
    
    $db->exec($createTable);

    // Sample maintenance schedules
    $schedules = [
        [
            'assetId' => 2,
            'type' => 'Regular Inspection',
            'frequency' => 'Monthly',
            'nextDueDate' => '2025-04-26',
            'description' => 'Monthly bicycle inspection'
        ],
        [
            'assetId' => 3,
            'type' => 'Preventive Maintenance',
            'frequency' => 'Quarterly',
            'nextDueDate' => '2025-06-26',
            'description' => 'Quarterly motorcycle service'
        ],
        [
            'assetId' => 4,
            'type' => 'Safety Check',
            'frequency' => 'Weekly',
            'nextDueDate' => '2025-04-02',
            'description' => 'Weekly generator safety inspection'
        ],
        [
            'assetId' => 5,
            'type' => 'Routine Maintenance',
            'frequency' => 'Monthly',
            'nextDueDate' => '2025-04-24',
            'description' => 'Monthly HVAC maintenance'
        ],
        [
            'assetId' => 8,
            'type' => 'Emergency Test',
            'frequency' => 'Weekly',
            'nextDueDate' => '2025-04-02',
            'description' => 'Weekly emergency generator test'
        ],
        [
            'assetId' => 2,
            'type' => 'Preventive Maintenance',
            'frequency' => 'Quarterly',
            'nextDueDate' => '2025-06-26',
            'description' => 'Quarterly bicycle overhaul'
        ],
        [
            'assetId' => 4,
            'type' => 'Oil Change',
            'frequency' => 'Monthly',
            'nextDueDate' => '2025-04-26',
            'description' => 'Monthly generator oil change'
        ],
        [
            'assetId' => 8,
            'type' => 'Battery Check',
            'frequency' => 'Monthly',
            'nextDueDate' => '2025-04-26',
            'description' => 'Monthly emergency generator battery test'
        ]
    ];

    $query = "INSERT INTO maintenanceschedules 
              (AssetID, ScheduleType, Frequency, NextDueDate, Description) 
              VALUES 
              (:assetId, :type, :frequency, :nextDueDate, :description)";
    
    $stmt = $db->prepare($query);
    $inserted = 0;
    
    foreach ($schedules as $schedule) {
        $stmt->bindParam(':assetId', $schedule['assetId']);
        $stmt->bindParam(':type', $schedule['type']);
        $stmt->bindParam(':frequency', $schedule['frequency']);
        $stmt->bindParam(':nextDueDate', $schedule['nextDueDate']);
        $stmt->bindParam(':description', $schedule['description']);
        
        if ($stmt->execute()) {
            $inserted++;
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Added $inserted test maintenance schedules",
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
