<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Get asset ID from URL parameter
    $assetId = isset($_GET['asset_id']) ? $_GET['asset_id'] : die();

    // Check user authorization
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!$auth_header) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Authorization required"
        ]);
        exit;
    }

    // Extract token
    $token = str_replace('Bearer ', '', $auth_header);
    
    // Verify user has access to this asset
    $userQuery = "SELECT UserID, UserRole FROM Users WHERE Token = ?";
    $userStmt = $db->prepare($userQuery);
    $userStmt->execute([$token]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid authorization token"
        ]);
        exit;
    }

    // Build query based on user role
    $query = "SELECT 
                mr.MaintenanceID,
                mr.AssetID,
                mr.TeamID,
                mr.MaintenanceDate,
                mr.MaintenanceType,
                mr.Description,
                mr.Cost,
                mr.MaintenanceStatus,
                mr.MaintenanceProvider,
                mt.TeamName,
                mt.TeamLeader,
                a.AssetName
              FROM MaintenanceRecords mr
              LEFT JOIN MaintenanceTeams mt ON mr.TeamID = mt.TeamID
              LEFT JOIN Assets a ON mr.AssetID = a.AssetID
              WHERE mr.AssetID = ?";

    // Add role-based conditions
    if ($user['UserRole'] !== 'Admin') {
        // Asset Managers and Maintenance Teams can only see their assigned assets
        if ($user['UserRole'] === 'Asset Manager') {
            $query .= " AND a.CreatedBy = ?";
        } elseif ($user['UserRole'] === 'Maintenance Team') {
            $query .= " AND mr.TeamID IN (SELECT TeamID FROM MaintenanceTeams WHERE TeamLeader = ?)";
        }
    }

    $query .= " ORDER BY mr.MaintenanceDate DESC";

    $stmt = $db->prepare($query);

    // Execute with appropriate parameters based on role
    if ($user['UserRole'] === 'Admin') {
        $stmt->execute([$assetId]);
    } else {
        $stmt->execute([$assetId, $user['UserID']]);
    }

    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($records) {
        // Format dates and numbers
        foreach ($records as &$record) {
            $record['MaintenanceDate'] = date('Y-m-d', strtotime($record['MaintenanceDate']));
            $record['Cost'] = floatval($record['Cost']);
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Maintenance records retrieved successfully",
            "data" => $records
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No maintenance records found for this asset"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>
