<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(
    !empty($data->AssetName) &&
    !empty($data->AssetType) &&
    !empty($data->Location) &&
    !empty($data->AcquisitionDate) &&
    !empty($data->InitialCost) &&
    !empty($data->CurrentValue) &&
    !empty($data->MaintenanceStatus)
){
    try {
        // Create query matching your database schema
        $query = "INSERT INTO Assets 
                  SET 
                    AssetName = :assetName,
                    AssetType = :assetType,
                    Location = :location,
                    AcquisitionDate = :acquisitionDate,
                    InitialCost = :initialCost,
                    CurrentValue = :currentValue,
                    MaintenanceStatus = :maintenanceStatus,
                    CreatedBy = :createdBy";

        // Prepare statement
        $stmt = $db->prepare($query);

        // Sanitize and bind data
        $assetName = htmlspecialchars(strip_tags($data->AssetName));
        $assetType = htmlspecialchars(strip_tags($data->AssetType));
        $location = htmlspecialchars(strip_tags($data->Location));
        $acquisitionDate = htmlspecialchars(strip_tags($data->AcquisitionDate));
        $initialCost = floatval($data->InitialCost);
        $currentValue = floatval($data->CurrentValue);
        $maintenanceStatus = htmlspecialchars(strip_tags($data->MaintenanceStatus));
        $createdBy = isset($data->CreatedBy) ? intval($data->CreatedBy) : null;

        $stmt->bindParam(":assetName", $assetName);
        $stmt->bindParam(":assetType", $assetType);
        $stmt->bindParam(":location", $location);
        $stmt->bindParam(":acquisitionDate", $acquisitionDate);
        $stmt->bindParam(":initialCost", $initialCost);
        $stmt->bindParam(":currentValue", $currentValue);
        $stmt->bindParam(":maintenanceStatus", $maintenanceStatus);
        $stmt->bindParam(":createdBy", $createdBy);

        // Execute query
        if($stmt->execute()){
            http_response_code(201);
            echo json_encode(array(
                "status" => "success",
                "message" => "Asset created successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "status" => "error",
                "message" => "Unable to create asset"
            ));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array(
            "status" => "error",
            "message" => "Database error: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "status" => "error",
        "message" => "Unable to create asset. Data is incomplete.",
        "required_fields" => [
            "AssetName",
            "AssetType (must be: Road, Bridge, Building, or Utility)",
            "Location",
            "AcquisitionDate",
            "InitialCost",
            "CurrentValue",
            "MaintenanceStatus (must be: Good, Fair, or Poor)"
        ],
        "received_data" => $data
    ));
}
?> 