-- Local Government Asset Management System Database Schema and Initialization

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
    MaintenanceType VARCHAR(50) NOT NULL, -- ENUM replaced with VARCHAR
    Description TEXT NOT NULL,
    Cost DECIMAL(15,2) NOT NULL,
    MaintenanceStatus VARCHAR(50) NOT NULL, -- ENUM replaced with VARCHAR
    MaintenanceProvider VARCHAR(50) NOT NULL, -- ENUM replaced with VARCHAR
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (TeamID) REFERENCES MaintenanceTeams(TeamID)
) ENGINE=InnoDB;

-- Maintenance Schedules Table
CREATE TABLE MaintenanceSchedules (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    AssetID INT NOT NULL,
    ScheduleType VARCHAR(50) NOT NULL, -- ENUM replaced with VARCHAR
    Frequency VARCHAR(50) NOT NULL, -- ENUM replaced with VARCHAR
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
    COUNT(mr.MaintenanceID) AS MaintenanceCount,
    COALESCE(SUM(mr.Cost), 0) AS TotalMaintenanceCost
FROM Assets a
LEFT JOIN MaintenanceRecords mr ON a.AssetID = mr.AssetID
GROUP BY a.AssetID;

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
            'MaintenanceStatus', CAST(OLD.MaintenanceStatus AS CHAR),
            'CurrentValue', CAST(OLD.CurrentValue AS CHAR),
            'LastMaintenanceDate', CAST(OLD.LastMaintenanceDate AS CHAR)
        ),
        JSON_OBJECT(
            'MaintenanceStatus', CAST(NEW.MaintenanceStatus AS CHAR),
            'CurrentValue', CAST(NEW.CurrentValue AS CHAR),
            'LastMaintenanceDate', CAST(NEW.LastMaintenanceDate AS CHAR)
        )
    );
END //
DELIMITER ;

-- Stored Procedures
DELIMITER //

CREATE PROCEDURE AddNewAsset(
    IN p_AssetName VARCHAR(100),
    IN p_AssetType VARCHAR(50),
    IN p_Location VARCHAR(255),
    IN p_AcquisitionDate DATE,
    IN p_InitialCost DECIMAL(15,2),
    IN p_CurrentValue DECIMAL(15,2),
    IN p_MaintenanceStatus VARCHAR(50),
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

CREATE PROCEDURE RecordMaintenance(
    IN p_AssetID INT,
    IN p_TeamID INT,
    IN p_MaintenanceDate DATE,
    IN p_MaintenanceType VARCHAR(50),
    IN p_Description TEXT,
    IN p_Cost DECIMAL(15,2),
    IN p_MaintenanceStatus VARCHAR(50),
    IN p_MaintenanceProvider VARCHAR(50)
)
BEGIN
    INSERT INTO MaintenanceRecords (
        AssetID, TeamID, MaintenanceDate, MaintenanceType,
        Description, Cost, MaintenanceStatus, MaintenanceProvider
    ) VALUES (
        p_AssetID, p_TeamID, p_MaintenanceDate, p_MaintenanceType,
        p_Description, p_Cost, p_MaintenanceStatus, p_MaintenanceProvider
    );
END //

DELIMITER ;

-- First make sure we're using the right database
USE local_govt_assets;

-- Clear any existing test users
DELETE FROM Users WHERE Email IN ('test@example.com', 'admin@localgov.com');

-- Insert test users with bcrypt hashed passwords
INSERT INTO Users (Username, Email, Password, UserRole, IsActive) VALUES
('TestUser', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Asset Manager', 1),
('AdminUser', 'admin@localgov.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 1);
