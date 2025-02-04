-- Initialize the database with sample data and stored procedures
USE local_govt_assets;

-- Add GoogleID column to Users table if it doesn't exist
ALTER TABLE Users
ADD COLUMN IF NOT EXISTS GoogleID VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS LastLogin TIMESTAMP NULL;

-- Sample Users
INSERT INTO Users (Username, Password, UserRole, Email, GoogleID, LastLogin) VALUES
('admin', MD5('admin123'), 'Admin', 'admin@localgov.com', NULL, NULL),
('manager', MD5('manager123'), 'Asset Manager', 'manager@localgov.com', NULL, NULL),
('maintenance', MD5('maint123'), 'Maintenance Team', 'maintenance@localgov.com', NULL, NULL);

-- Sample Maintenance Teams
INSERT INTO MaintenanceTeams (TeamName, TeamLeader, ContactPhone, ContactEmail) VALUES
('Road Maintenance A', 'John Doe', '0700123456', 'team.a@localgov.com'),
('Building Maintenance B', 'Jane Smith', '0700789012', 'team.b@localgov.com'),
('Utility Maintenance C', 'Bob Wilson', '0700345678', 'team.c@localgov.com');

-- Sample Assets
INSERT INTO Assets (
    AssetName, AssetType, Location, AcquisitionDate, 
    InitialCost, CurrentValue, MaintenanceStatus, 
    LastMaintenanceDate, NextMaintenanceDate, CreatedBy
) VALUES
('Main Town Hall', 'Building', 'Central District', '2020-01-15', 
 500000000, 450000000, 'Good', '2024-12-01', '2025-06-01', 1),
('Bridge A1', 'Bridge', 'North District', '2019-06-20',
 200000000, 180000000, 'Fair', '2024-11-15', '2025-02-15', 1),
('Water Supply System', 'Utility', 'All Districts', '2018-03-10',
 300000000, 250000000, 'Good', '2024-12-20', '2025-03-20', 1);

-- Sample Maintenance Records
INSERT INTO MaintenanceRecords (
    AssetID, TeamID, MaintenanceDate, MaintenanceType,
    Description, Cost, MaintenanceStatus, MaintenanceProvider
) VALUES
(1, 2, '2024-12-01', 'Routine',
 'Regular building inspection and minor repairs', 2000000, 'Completed', 'In-House'),
(2, 1, '2024-11-15', 'Repairs',
 'Bridge support reinforcement', 5000000, 'Completed', 'Contractor'),
(3, 3, '2024-12-20', 'Routine',
 'Water system inspection and cleaning', 1500000, 'Completed', 'In-House');

-- Sample Maintenance Schedules
INSERT INTO MaintenanceSchedules (
    AssetID, ScheduleType, Frequency, NextDueDate, LastCompletedDate
) VALUES
(1, 'Regular Inspections', 'Monthly', '2025-02-01', '2024-12-01'),
(2, 'Preventive Maintenance', 'Quarterly', '2025-02-15', '2024-11-15'),
(3, 'Regular Inspections', 'Monthly', '2025-01-20', '2024-12-20');

-- Stored Procedures

DELIMITER //

-- Add New Asset
CREATE PROCEDURE AddNewAsset(
    IN p_AssetName VARCHAR(100),
    IN p_AssetType ENUM('Road', 'Bridge', 'Building', 'Utility'),
    IN p_Location VARCHAR(255),
    IN p_AcquisitionDate DATE,
    IN p_InitialCost DECIMAL(15,2),
    IN p_CurrentValue DECIMAL(15,2),
    IN p_MaintenanceStatus ENUM('Good', 'Fair', 'Poor'),
    IN p_CreatedBy INT
)
BEGIN
    INSERT INTO Assets (
        AssetName, AssetType, Location, AcquisitionDate,
        InitialCost, CurrentValue, MaintenanceStatus, CreatedBy
    ) VALUES (
        p_AssetName, p_AssetType, p_Location, p_AcquisitionDate,
        p_InitialCost, p_CurrentValue, p_MaintenanceStatus, p_CreatedBy
    );
END //

-- Schedule Maintenance
CREATE PROCEDURE ScheduleMaintenance(
    IN p_AssetID INT,
    IN p_ScheduleType ENUM('Regular Inspections', 'Preventive Maintenance'),
    IN p_Frequency ENUM('Monthly', 'Quarterly', 'Annually'),
    IN p_NextDueDate DATE
)
BEGIN
    INSERT INTO MaintenanceSchedules (
        AssetID, ScheduleType, Frequency, NextDueDate
    ) VALUES (
        p_AssetID, p_ScheduleType, p_Frequency, p_NextDueDate
    );
END //

-- Record Maintenance
CREATE PROCEDURE RecordMaintenance(
    IN p_AssetID INT,
    IN p_TeamID INT,
    IN p_MaintenanceDate DATE,
    IN p_MaintenanceType ENUM('Routine', 'Repairs', 'Upgrades'),
    IN p_Description TEXT,
    IN p_Cost DECIMAL(15,2),
    IN p_MaintenanceStatus ENUM('Completed', 'In Progress', 'Pending'),
    IN p_MaintenanceProvider ENUM('In-House', 'Contractor')
)
BEGIN
    INSERT INTO MaintenanceRecords (
        AssetID, TeamID, MaintenanceDate, MaintenanceType,
        Description, Cost, MaintenanceStatus, MaintenanceProvider
    ) VALUES (
        p_AssetID, p_TeamID, p_MaintenanceDate, p_MaintenanceType,
        p_Description, p_Cost, p_MaintenanceStatus, p_MaintenanceProvider
    );
    
    -- Update asset's last maintenance date
    UPDATE Assets 
    SET LastMaintenanceDate = p_MaintenanceDate,
        MaintenanceStatus = 'Good'
    WHERE AssetID = p_AssetID;
    
    -- Update maintenance schedule if exists
    UPDATE MaintenanceSchedules
    SET LastCompletedDate = p_MaintenanceDate,
        NextDueDate = CASE 
            WHEN Frequency = 'Monthly' THEN DATE_ADD(p_MaintenanceDate, INTERVAL 1 MONTH)
            WHEN Frequency = 'Quarterly' THEN DATE_ADD(p_MaintenanceDate, INTERVAL 3 MONTH)
            WHEN Frequency = 'Annually' THEN DATE_ADD(p_MaintenanceDate, INTERVAL 1 YEAR)
        END
    WHERE AssetID = p_AssetID;
END //

-- Get Asset Details with Maintenance History
CREATE PROCEDURE GetAssetDetails(IN p_AssetID INT)
BEGIN
    SELECT 
        a.*,
        mr.MaintenanceDate,
        mr.MaintenanceType,
        mr.Description,
        mr.Cost,
        mr.MaintenanceStatus,
        mt.TeamName,
        ms.ScheduleType,
        ms.Frequency,
        ms.NextDueDate
    FROM Assets a
    LEFT JOIN MaintenanceRecords mr ON a.AssetID = mr.AssetID
    LEFT JOIN MaintenanceTeams mt ON mr.TeamID = mt.TeamID
    LEFT JOIN MaintenanceSchedules ms ON a.AssetID = ms.AssetID
    WHERE a.AssetID = p_AssetID
    ORDER BY mr.MaintenanceDate DESC;
END //

-- Get Due Maintenance
CREATE PROCEDURE GetDueMaintenance(IN p_DaysAhead INT)
BEGIN
    SELECT 
        a.AssetID,
        a.AssetName,
        a.AssetType,
        a.Location,
        ms.ScheduleType,
        ms.Frequency,
        ms.NextDueDate,
        mt.TeamName
    FROM Assets a
    JOIN MaintenanceSchedules ms ON a.AssetID = ms.AssetID
    LEFT JOIN MaintenanceRecords mr ON a.AssetID = mr.AssetID
    LEFT JOIN MaintenanceTeams mt ON mr.TeamID = mt.TeamID
    WHERE ms.NextDueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL p_DaysAhead DAY)
    ORDER BY ms.NextDueDate;
END //

-- Update Asset Value
CREATE PROCEDURE UpdateAssetValue(
    IN p_AssetID INT,
    IN p_NewValue DECIMAL(15,2),
    IN p_UpdatedBy INT
)
BEGIN
    UPDATE Assets 
    SET CurrentValue = p_NewValue,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE AssetID = p_AssetID;
    
    INSERT INTO AuditLog (UserID, Action, TableName, RecordID, OldValue, NewValue)
    SELECT 
        p_UpdatedBy,
        'UPDATE_VALUE',
        'Assets',
        p_AssetID,
        CAST(CurrentValue AS CHAR),
        CAST(p_NewValue AS CHAR)
    FROM Assets
    WHERE AssetID = p_AssetID;
END //

DELIMITER ;

-- Create Event to Update Asset Status Based on Maintenance Schedule
CREATE EVENT IF NOT EXISTS update_asset_status
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE Assets a
    SET MaintenanceStatus = 
        CASE 
            WHEN DATEDIFF(NextMaintenanceDate, CURDATE()) < 0 THEN 'Poor'
            WHEN DATEDIFF(NextMaintenanceDate, CURDATE()) < 30 THEN 'Fair'
            ELSE MaintenanceStatus
        END
    WHERE NextMaintenanceDate IS NOT NULL;
