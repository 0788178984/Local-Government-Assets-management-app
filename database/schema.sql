-- Local Government Asset Management System Database Schema

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS local_govt_assets;
USE local_govt_assets;

-- Users Table for Authentication and Authorization
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NULL, -- Stores hashed password, NULL for social auth users
    UserRole ENUM('Admin', 'Asset Manager', 'Maintenance Team') NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    GoogleID VARCHAR(255) NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    AuthProvider ENUM('Local', 'Google', 'GitHub') DEFAULT 'Local'
) ENGINE=InnoDB;

-- Assets Table
CREATE TABLE Assets (
    AssetID INT AUTO_INCREMENT PRIMARY KEY,
    AssetName VARCHAR(100) NOT NULL,
    AssetType ENUM('Road', 'Bridge', 'Building', 'Utility') NOT NULL,
    Location VARCHAR(255) NOT NULL,
    AcquisitionDate DATE NOT NULL,
    InitialCost DECIMAL(15,2) NOT NULL,
    CurrentValue DECIMAL(15,2) NOT NULL,
    MaintenanceStatus ENUM('Good', 'Fair', 'Poor') NOT NULL,
    LastMaintenanceDate DATE,
    NextMaintenanceDate DATE,
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
) ENGINE=InnoDB;

-- Maintenance Teams Table
CREATE TABLE MaintenanceTeams (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL UNIQUE,
    TeamLeader VARCHAR(100) NOT NULL,
    ContactPhone VARCHAR(20) NOT NULL,
    ContactEmail VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Maintenance Records Table
CREATE TABLE MaintenanceRecords (
    MaintenanceID INT AUTO_INCREMENT PRIMARY KEY,
    AssetID INT NOT NULL,
    TeamID INT,
    MaintenanceDate DATE NOT NULL,
    MaintenanceType ENUM('Routine', 'Repairs', 'Upgrades') NOT NULL,
    Description TEXT NOT NULL,
    Cost DECIMAL(15,2) NOT NULL,
    MaintenanceStatus ENUM('Completed', 'In Progress', 'Pending') NOT NULL,
    MaintenanceProvider ENUM('In-House', 'Contractor') NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (TeamID) REFERENCES MaintenanceTeams(TeamID)
) ENGINE=InnoDB;

-- Maintenance Schedules Table
CREATE TABLE MaintenanceSchedules (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    AssetID INT NOT NULL,
    ScheduleType ENUM('Regular Inspections', 'Preventive Maintenance') NOT NULL,
    Frequency ENUM('Monthly', 'Quarterly', 'Annually') NOT NULL,
    NextDueDate DATE NOT NULL,
    LastCompletedDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID)
) ENGINE=InnoDB;

-- Audit Log Table
CREATE TABLE AuditLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Action VARCHAR(50) NOT NULL,
    TableName VARCHAR(50) NOT NULL,
    RecordID INT NOT NULL,
    OldValue TEXT,
    NewValue TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
) ENGINE=InnoDB;

-- Create indexes for better performance
CREATE INDEX idx_assets_type ON Assets(AssetType);
CREATE INDEX idx_assets_status ON Assets(MaintenanceStatus);
CREATE INDEX idx_maintenance_asset ON MaintenanceRecords(AssetID);
CREATE INDEX idx_maintenance_date ON MaintenanceRecords(MaintenanceDate);
CREATE INDEX idx_schedules_asset ON MaintenanceSchedules(AssetID);
CREATE INDEX idx_schedules_due ON MaintenanceSchedules(NextDueDate);
CREATE INDEX idx_audit_user ON AuditLog(UserID);
CREATE INDEX idx_audit_table ON AuditLog(TableName);

-- Create view for asset summary
CREATE VIEW AssetSummaryView AS
SELECT 
    a.AssetID,
    a.AssetName,
    a.AssetType,
    a.Location,
    a.MaintenanceStatus,
    a.LastMaintenanceDate,
    a.NextMaintenanceDate,
    COUNT(mr.MaintenanceID) as MaintenanceCount,
    COALESCE(SUM(mr.Cost), 0) as TotalMaintenanceCost
FROM Assets a
LEFT JOIN MaintenanceRecords mr ON a.AssetID = mr.AssetID
GROUP BY a.AssetID, a.AssetName, a.AssetType, a.Location, 
         a.MaintenanceStatus, a.LastMaintenanceDate, a.NextMaintenanceDate;

-- Create view for upcoming maintenance
CREATE VIEW UpcomingMaintenanceView AS
SELECT 
    a.AssetID,
    a.AssetName,
    ms.ScheduleType,
    ms.Frequency,
    ms.NextDueDate
FROM Assets a
JOIN MaintenanceSchedules ms ON a.AssetID = ms.AssetID
WHERE ms.NextDueDate > CURDATE()
ORDER BY ms.NextDueDate;

-- Create trigger for audit logging on Assets
DELIMITER //
CREATE TRIGGER audit_assets_update
AFTER UPDATE ON Assets
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (UserID, Action, TableName, RecordID, OldValue, NewValue)
    VALUES (
        NEW.CreatedBy,
        'UPDATE',
        'Assets',
        NEW.AssetID,
        JSON_OBJECT(
            'MaintenanceStatus', OLD.MaintenanceStatus,
            'CurrentValue', OLD.CurrentValue,
            'LastMaintenanceDate', OLD.LastMaintenanceDate
        ),
        JSON_OBJECT(
            'MaintenanceStatus', NEW.MaintenanceStatus,
            'CurrentValue', NEW.CurrentValue,
            'LastMaintenanceDate', NEW.LastMaintenanceDate
        )
    );
END //
DELIMITER ;
