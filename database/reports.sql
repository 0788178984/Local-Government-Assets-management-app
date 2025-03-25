-- Reports Table
CREATE TABLE Reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    GeneratedBy INT,
    GeneratedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    ReportType VARCHAR(50) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    FOREIGN KEY (GeneratedBy) REFERENCES Users(UserID)
) ENGINE=InnoDB;
