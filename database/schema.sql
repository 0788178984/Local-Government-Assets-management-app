-- Local Government Asset Management System Database Schema

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users Table for Authentication and Authorization
CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL, -- Stores hashed password
    UserRole VARCHAR(20) NOT NULL CHECK (UserRole IN ('Admin', 'Asset Manager', 'Maintenance Team')),
    Email VARCHAR(100) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- Assets Table
CREATE TABLE Assets (
    AssetID INTEGER PRIMARY KEY AUTOINCREMENT,
    AssetName VARCHAR(100) NOT NULL,
    AssetType VARCHAR(50) NOT NULL CHECK (AssetType IN ('Road', 'Bridge', 'Building', 'Utility')),
    Location VARCHAR(255) NOT NULL,
    AcquisitionDate DATE NOT NULL,
    InitialCost DECIMAL(15,2) NOT NULL,
    CurrentValue DECIMAL(15,2) NOT NULL,
    MaintenanceStatus VARCHAR(20) NOT NULL CHECK (MaintenanceStatus IN ('Good', 'Fair', 'Poor')),
    LastMaintenanceDate DATE,
    NextMaintenanceDate DATE,
    CreatedBy INTEGER,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Maintenance Teams Table
CREATE TABLE MaintenanceTeams (
    TeamID INTEGER PRIMARY KEY AUTOINCREMENT,
    TeamName VARCHAR(100) NOT NULL UNIQUE,
    TeamLeader VARCHAR(100) NOT NULL,
    ContactPhone VARCHAR(20) NOT NULL,
    ContactEmail VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- Maintenance Records Table
CREATE TABLE MaintenanceRecords (
    MaintenanceID INTEGER PRIMARY KEY AUTOINCREMENT,
    AssetID INTEGER NOT NULL,
    TeamID INTEGER,
    MaintenanceDate DATE NOT NULL,
    MaintenanceType VARCHAR(50) NOT NULL CHECK (MaintenanceType IN ('Routine', 'Repairs', 'Upgrades')),
    Description TEXT NOT NULL,
    Cost DECIMAL(15,2) NOT NULL,
    MaintenanceStatus VARCHAR(20) NOT NULL CHECK (MaintenanceStatus IN ('Completed', 'In Progress', 'Pending')),
    MaintenanceProvider VARCHAR(50) NOT NULL CHECK (MaintenanceProvider IN ('In-House', 'Contractor')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (TeamID) REFERENCES MaintenanceTeams(TeamID)
);

-- Maintenance Schedules Table
CREATE TABLE MaintenanceSchedules (
    ScheduleID INTEGER PRIMARY KEY AUTOINCREMENT,
    AssetID INTEGER NOT NULL,
    ScheduleType VARCHAR(50) NOT NULL CHECK (ScheduleType IN ('Regular Inspections', 'Preventive Maintenance')),
    Frequency VARCHAR(20) NOT NULL CHECK (Frequency IN ('Monthly', 'Quarterly', 'Annually')),
    NextDueDate DATE NOT NULL,
    LastCompletedDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID)
);

-- Audit Log Table
CREATE TABLE AuditLog (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER,
    Action VARCHAR(50) NOT NULL,
    TableName VARCHAR(50) NOT NULL,
    RecordID INTEGER NOT NULL,
    OldValue TEXT,
    NewValue TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

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
    SUM(mr.Cost) as TotalMaintenanceCost
FROM Assets a
LEFT JOIN MaintenanceRecords mr ON a.AssetID = mr.AssetID
GROUP BY a.AssetID;

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
WHERE ms.NextDueDate > CURRENT_DATE
ORDER BY ms.NextDueDate;

-- Create trigger to update Assets.UpdatedAt
CREATE TRIGGER update_asset_timestamp
AFTER UPDATE ON Assets
BEGIN
    UPDATE Assets SET UpdatedAt = CURRENT_TIMESTAMP
    WHERE AssetID = NEW.AssetID;
END;

-- Create trigger to update MaintenanceRecords.UpdatedAt
CREATE TRIGGER update_maintenance_timestamp
AFTER UPDATE ON MaintenanceRecords
BEGIN
    UPDATE MaintenanceRecords SET UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaintenanceID = NEW.MaintenanceID;
END;

-- Create trigger to update MaintenanceSchedules.UpdatedAt
CREATE TRIGGER update_schedule_timestamp
AFTER UPDATE ON MaintenanceSchedules
BEGIN
    UPDATE MaintenanceSchedules SET UpdatedAt = CURRENT_TIMESTAMP
    WHERE ScheduleID = NEW.ScheduleID;
END;

-- Create trigger for audit logging on Assets
CREATE TRIGGER audit_assets
AFTER UPDATE ON Assets
BEGIN
    INSERT INTO AuditLog (UserID, Action, TableName, RecordID, OldValue, NewValue)
    VALUES (
        NEW.CreatedBy,
        'UPDATE',
        'Assets',
        NEW.AssetID,
        json_object(
            'MaintenanceStatus', OLD.MaintenanceStatus,
            'CurrentValue', OLD.CurrentValue,
            'LastMaintenanceDate', OLD.LastMaintenanceDate
        ),
        json_object(
            'MaintenanceStatus', NEW.MaintenanceStatus,
            'CurrentValue', NEW.CurrentValue,
            'LastMaintenanceDate', NEW.LastMaintenanceDate
        )
    );
END;
