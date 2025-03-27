-- Create database if not exists
CREATE DATABASE IF NOT EXISTS local_govt_assets;
USE local_govt_assets;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'user',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    AssetID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Category VARCHAR(50),
    Condition VARCHAR(20) CHECK (Condition IN ('Good', 'Fair', 'Poor')),
    PurchaseDate DATE,
    PurchasePrice DECIMAL(10,2),
    Location VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'Active',
    LastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create maintenance_teams table
CREATE TABLE IF NOT EXISTS maintenance_teams (
    TeamID INT PRIMARY KEY AUTO_INCREMENT,
    TeamName VARCHAR(100) NOT NULL,
    Leader VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    RecordID INT PRIMARY KEY AUTO_INCREMENT,
    AssetID INT,
    TeamID INT,
    MaintenanceDate DATE,
    Description TEXT,
    Cost DECIMAL(10,2),
    Status VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AssetID) REFERENCES assets(AssetID),
    FOREIGN KEY (TeamID) REFERENCES maintenance_teams(TeamID)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    GeneratedBy INT,
    GeneratedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReportType VARCHAR(50),
    Status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (GeneratedBy) REFERENCES users(UserID)
);

-- Insert default admin user if not exists
INSERT INTO users (Username, Email, Password, Role)
SELECT 'admin', 'admin@localgov.com', MD5('password'), 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE Email = 'admin@localgov.com'
); 