-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2025 at 06:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `local_govt_assets`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddNewAsset` (IN `p_AssetName` VARCHAR(100), IN `p_AssetType` VARCHAR(50), IN `p_Location` VARCHAR(255), IN `p_AcquisitionDate` DATE, IN `p_InitialCost` DECIMAL(15,2), IN `p_CurrentValue` DECIMAL(15,2), IN `p_MaintenanceStatus` VARCHAR(50), IN `p_CreatedBy` INT)   BEGIN
    INSERT INTO Assets (
        AssetName, AssetType, Location, AcquisitionDate,
        InitialCost, CurrentValue, MaintenanceStatus, CreatedBy
    ) VALUES (
        p_AssetName, p_AssetType, p_Location, p_AcquisitionDate,
        p_InitialCost, p_CurrentValue, p_MaintenanceStatus, p_CreatedBy
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RecordMaintenance` (IN `p_AssetID` INT, IN `p_TeamID` INT, IN `p_MaintenanceDate` DATE, IN `p_MaintenanceType` VARCHAR(50), IN `p_Description` TEXT, IN `p_Cost` DECIMAL(15,2), IN `p_MaintenanceStatus` VARCHAR(50), IN `p_MaintenanceProvider` VARCHAR(50))   BEGIN
    INSERT INTO MaintenanceRecords (
        AssetID, TeamID, MaintenanceDate, MaintenanceType,
        Description, Cost, MaintenanceStatus, MaintenanceProvider
    ) VALUES (
        p_AssetID, p_TeamID, p_MaintenanceDate, p_MaintenanceType,
        p_Description, p_Cost, p_MaintenanceStatus, p_MaintenanceProvider
    );
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `AssetID` int(11) NOT NULL,
  `AssetName` varchar(100) NOT NULL,
  `AssetType` enum('Road','Bridge','Building','Utility') NOT NULL,
  `Location` varchar(255) NOT NULL,
  `AcquisitionDate` date NOT NULL,
  `InitialCost` decimal(15,2) NOT NULL,
  `CurrentValue` decimal(15,2) NOT NULL,
  `MaintenanceStatus` varchar(50) DEFAULT NULL,
  `LastMaintenanceDate` datetime DEFAULT NULL,
  `NextMaintenanceDate` datetime DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`AssetID`, `AssetName`, `AssetType`, `Location`, `AcquisitionDate`, `InitialCost`, `CurrentValue`, `MaintenanceStatus`, `LastMaintenanceDate`, `NextMaintenanceDate`, `CreatedBy`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Car', '', 'Gulu', '2025-02-02', 2000.00, 105000.00, 'Good', '2025-01-21 16:16:52', '2025-07-21 16:16:52', NULL, '2025-03-21 12:01:59', '2025-03-21 13:16:52'),
(2, 'Bicycle ', '', 'Gulu', '0000-00-00', 500000.00, 450000.00, 'Good', '2025-03-21 00:00:00', '2025-03-22 16:16:52', NULL, '2025-03-21 12:14:18', '2025-03-21 13:54:20'),
(3, 'Motorcycle ', 'Road', 'Gulu', '0000-00-00', 5000000.00, 4000000.00, 'Poor', '2025-02-21 16:16:52', '2025-04-04 16:16:52', NULL, '2025-03-21 12:15:48', '2025-03-21 13:16:52'),
(4, 'Generator Set A', '', 'Main Building', '2023-01-15', 15000.00, 15000.00, 'Good', '2023-12-01 00:00:00', NULL, NULL, '2025-03-21 13:44:24', '2025-03-21 13:44:24'),
(5, 'HVAC System 1', '', 'Office Block', '2023-02-20', 25000.00, 24000.00, 'Fair', '2023-11-15 00:00:00', NULL, NULL, '2025-03-21 13:44:24', '2025-03-21 13:44:24'),
(6, 'Water Pump B', '', 'Utility Room', '2023-03-10', 8000.00, 7500.00, 'Good', '2023-12-10 00:00:00', NULL, NULL, '2025-03-21 13:44:24', '2025-03-21 13:44:24'),
(7, 'Security Camera System', '', 'Perimeter', '2023-04-05', 12000.00, 11000.00, 'Good', '2023-11-30 00:00:00', NULL, NULL, '2025-03-21 13:44:24', '2025-03-21 13:44:24'),
(8, 'Emergency Generator', '', 'Backup Room', '2023-05-01', 20000.00, 19000.00, 'Fair', '2023-12-05 00:00:00', NULL, NULL, '2025-03-21 13:44:24', '2025-03-21 13:44:24');

--
-- Triggers `assets`
--
DELIMITER $$
CREATE TRIGGER `audit_assets_update` AFTER UPDATE ON `assets` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `assetsummaryview`
-- (See below for the actual view)
--
CREATE TABLE `assetsummaryview` (
`AssetID` int(11)
,`AssetName` varchar(100)
,`AssetType` enum('Road','Bridge','Building','Utility')
,`Location` varchar(255)
,`MaintenanceStatus` varchar(50)
,`LastMaintenanceDate` datetime
,`NextMaintenanceDate` datetime
,`MaintenanceCount` bigint(21)
,`TotalMaintenanceCost` decimal(37,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `LogID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Action` varchar(50) NOT NULL,
  `TableName` varchar(50) NOT NULL,
  `RecordID` int(11) NOT NULL,
  `OldValue` text DEFAULT NULL,
  `NewValue` text DEFAULT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auditlog`
--

INSERT INTO `auditlog` (`LogID`, `UserID`, `Action`, `TableName`, `RecordID`, `OldValue`, `NewValue`, `Timestamp`) VALUES
(1, NULL, 'UPDATE', 'Assets', 1, '{\"MaintenanceStatus\": \"Fair\", \"CurrentValue\": \"105000.00\", \"LastMaintenanceDate\": null}', '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"105000.00\", \"LastMaintenanceDate\": \"2025-01-21\"}', '2025-03-21 13:15:42'),
(2, NULL, 'UPDATE', 'Assets', 2, '{\"MaintenanceStatus\": \"Poor\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": null}', '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": \"2024-09-21\"}', '2025-03-21 13:15:42'),
(3, NULL, 'UPDATE', 'Assets', 3, '{\"MaintenanceStatus\": \"Good\", \"CurrentValue\": \"4000000.00\", \"LastMaintenanceDate\": null}', '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"4000000.00\", \"LastMaintenanceDate\": \"2025-02-21\"}', '2025-03-21 13:15:42'),
(4, NULL, 'UPDATE', 'Assets', 1, '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"105000.00\", \"LastMaintenanceDate\": \"2025-01-21 00:00:00\"}', '{\"MaintenanceStatus\": \"Good\", \"CurrentValue\": \"105000.00\", \"LastMaintenanceDate\": \"2025-01-21 16:16:52\"}', '2025-03-21 13:16:52'),
(5, NULL, 'UPDATE', 'Assets', 2, '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": \"2024-09-21 00:00:00\"}', '{\"MaintenanceStatus\": \"Fair\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": \"2024-09-21 16:16:52\"}', '2025-03-21 13:16:52'),
(6, NULL, 'UPDATE', 'Assets', 3, '{\"MaintenanceStatus\": \"\", \"CurrentValue\": \"4000000.00\", \"LastMaintenanceDate\": \"2025-02-21 00:00:00\"}', '{\"MaintenanceStatus\": \"Poor\", \"CurrentValue\": \"4000000.00\", \"LastMaintenanceDate\": \"2025-02-21 16:16:52\"}', '2025-03-21 13:16:52'),
(7, NULL, 'UPDATE', 'Assets', 2, '{\"MaintenanceStatus\": \"Fair\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": \"2024-09-21 16:16:52\"}', '{\"MaintenanceStatus\": \"Good\", \"CurrentValue\": \"450000.00\", \"LastMaintenanceDate\": \"2025-03-21 00:00:00\"}', '2025-03-21 13:54:20');

-- --------------------------------------------------------

--
-- Table structure for table `maintenancerecords`
--

CREATE TABLE `maintenancerecords` (
  `MaintenanceID` int(11) NOT NULL,
  `AssetID` int(11) NOT NULL,
  `TeamID` int(11) DEFAULT NULL,
  `MaintenanceDate` date NOT NULL,
  `MaintenanceType` varchar(50) NOT NULL,
  `Description` text NOT NULL,
  `Cost` decimal(15,2) NOT NULL,
  `MaintenanceStatus` varchar(50) NOT NULL,
  `MaintenanceProvider` varchar(50) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenancerecords`
--

INSERT INTO `maintenancerecords` (`MaintenanceID`, `AssetID`, `TeamID`, `MaintenanceDate`, `MaintenanceType`, `Description`, `Cost`, `MaintenanceStatus`, `MaintenanceProvider`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 2, 10, '2025-03-21', 'Repair', 'Replacing tyres', 2000.00, 'Pending', '', '2025-03-21 13:54:20', '2025-03-21 13:54:20');

-- --------------------------------------------------------

--
-- Table structure for table `maintenanceschedules`
--

CREATE TABLE `maintenanceschedules` (
  `ScheduleID` int(11) NOT NULL,
  `AssetID` int(11) NOT NULL,
  `ScheduleType` varchar(50) NOT NULL,
  `Frequency` varchar(50) NOT NULL,
  `NextDueDate` date NOT NULL,
  `LastCompletedDate` date DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenanceteams`
--

CREATE TABLE `maintenanceteams` (
  `TeamID` int(11) NOT NULL,
  `TeamName` varchar(100) NOT NULL,
  `TeamLeader` varchar(100) NOT NULL,
  `ContactPhone` varchar(20) NOT NULL,
  `ContactEmail` varchar(100) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenanceteams`
--

INSERT INTO `maintenanceteams` (`TeamID`, `TeamName`, `TeamLeader`, `ContactPhone`, `ContactEmail`, `CreatedAt`, `IsActive`) VALUES
(8, 'Mechanical Team', 'Asiimwe Lucky', '+256-701-234567', 'asiimwe.lucky@localgov.com', '2025-03-21 13:52:08', 1),
(9, 'Electrical Team', 'Johnson Smith', '+256-702-345678', 'johnson.smith@localgov.com', '2025-03-21 13:52:08', 1),
(10, 'General Maintenance', 'Peter Brown', '+256-703-456789', 'peter.brown@localgov.com', '2025-03-21 13:52:08', 1),
(11, 'Emergency Response', 'Pascal Wilson', '+256-704-567890', 'pascal.wilson@localgov.com', '2025-03-21 13:52:08', 1),
(12, 'Preventive Maintenance', 'Lucky James', '+256-705-678901', 'lucky.james@localgov.com', '2025-03-21 13:52:08', 1),
(13, 'Team 1', 'Leader One', '+256-711-111111', 'team1.leader@localgov.com', '2025-03-21 13:52:08', 1),
(14, 'Team 2', 'Leader Two', '+256-722-222222', 'team2.leader@localgov.com', '2025-03-21 13:52:08', 1),
(15, 'Team 3', 'Leader Three', '+256-733-333333', 'team3.leader@localgov.com', '2025-03-21 13:52:08', 1),
(16, 'Team 4', 'Leader Four', '+256-744-444444', 'team4.leader@localgov.com', '2025-03-21 13:52:08', 1),
(17, 'Team 5', 'Leader Five', '+256-755-555555', 'team5.leader@localgov.com', '2025-03-21 13:52:08', 1);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_records`
--

CREATE TABLE `maintenance_records` (
  `MaintenanceID` int(11) NOT NULL,
  `AssetID` int(11) NOT NULL,
  `TeamID` int(11) NOT NULL,
  `MaintenanceType` varchar(50) NOT NULL,
  `Description` text DEFAULT NULL,
  `MaintenanceDate` date NOT NULL,
  `Cost` decimal(10,2) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Pending',
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_records_backup`
--

CREATE TABLE `maintenance_records_backup` (
  `MaintenanceID` int(11) NOT NULL DEFAULT 0,
  `AssetID` int(11) NOT NULL,
  `TeamID` int(11) NOT NULL,
  `MaintenanceType` varchar(50) NOT NULL,
  `Description` text DEFAULT NULL,
  `MaintenanceDate` date NOT NULL,
  `Cost` decimal(10,2) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Pending',
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_teams`
--

CREATE TABLE `maintenance_teams` (
  `TeamID` int(11) NOT NULL,
  `TeamName` varchar(100) NOT NULL,
  `TeamLeader` varchar(100) NOT NULL,
  `ContactPhone` varchar(20) DEFAULT NULL,
  `ContactEmail` varchar(100) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Active',
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_teams`
--

INSERT INTO `maintenance_teams` (`TeamID`, `TeamName`, `TeamLeader`, `ContactPhone`, `ContactEmail`, `Status`, `CreatedAt`) VALUES
(1, 'Mechanical Team', 'Asiimwe Lucky', '+256-701-234-567', 'asiimwe@localgov.com', 'Active', '2025-03-21 16:15:42'),
(2, 'Electrical Team', 'Johnson Smith', '+256-702-345-678', 'johnson@localgov.com', 'Active', '2025-03-21 16:15:42'),
(3, 'General Maintenance', 'Peter Brown', '+256-703-456-789', 'peter@localgov.com', 'Active', '2025-03-21 16:15:42'),
(4, 'Emergency Response', 'Pascal Wilson', '+256-704-567-890', 'pascal@localgov.com', 'Active', '2025-03-21 16:15:42'),
(5, 'Preventive Maintenance', 'Lucky James', '+256-705-678-901', 'lucky@localgov.com', 'Active', '2025-03-21 16:15:42'),
(16, 'Asmart', 'Asiimwe', '0788178984', 'butoosaguluvarsity@gmail.com', 'Active', '2025-03-21 16:37:11'),
(17, 'Tessa', 'Joseph', '0779648456', 'asiimweivan2024@gmail.com', 'Active', '2025-03-21 16:37:58'),
(18, 'Luckyone', 'Today\'s test', '078849488', 'asiimwelucky34@gmail.com', 'Active', '2025-03-22 22:05:12');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `ReportID` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `ReportType` varchar(50) NOT NULL,
  `GeneratedBy` int(11) NOT NULL,
  `GeneratedDate` datetime DEFAULT current_timestamp(),
  `Status` varchar(20) DEFAULT 'Active',
  `FileURL` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `UserRole` enum('Admin','Asset Manager','Maintenance Team') NOT NULL,
  `Email` varchar(100) NOT NULL,
  `GoogleID` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `LastLogin` timestamp NULL DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `AuthProvider` enum('Local','Google','GitHub') DEFAULT 'Local'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `UserRole`, `Email`, `GoogleID`, `CreatedAt`, `LastLogin`, `IsActive`, `AuthProvider`) VALUES
(1, 'TestUser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Asset Manager', 'test@example.com', NULL, '2025-03-21 07:32:37', NULL, 1, 'Local'),
(3, 'AdminUser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin@localgov.com', NULL, '2025-03-21 11:57:49', '2025-03-23 17:01:39', 1, 'Local');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `SessionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `ExpiresAt` timestamp NULL DEFAULT NULL,
  `LastActivity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`SessionID`, `UserID`, `Token`, `CreatedAt`, `ExpiresAt`, `LastActivity`) VALUES
(1, 3, 'b66d8ce2c077a0fd1addecb4776dade59eaa0d886a09f359bf03c29eb883a768', '2025-03-21 12:46:40', '2025-03-22 12:46:40', '2025-03-21 12:46:40'),
(2, 3, '9a891d5c0293efb6c40327cb21b608a5dcdee22a1821f12e0083f0f2db799fec', '2025-03-21 13:04:48', '2025-03-22 13:04:48', '2025-03-21 13:04:48'),
(3, 3, 'ee5a9ce5b6ba10ad67398a6f004d38249bf7b5db8d2f2acf323474e20af2d5b6', '2025-03-21 14:01:02', '2025-03-22 14:01:02', '2025-03-21 14:01:02');

-- --------------------------------------------------------

--
-- Structure for view `assetsummaryview`
--
DROP TABLE IF EXISTS `assetsummaryview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `assetsummaryview`  AS SELECT `a`.`AssetID` AS `AssetID`, `a`.`AssetName` AS `AssetName`, `a`.`AssetType` AS `AssetType`, `a`.`Location` AS `Location`, `a`.`MaintenanceStatus` AS `MaintenanceStatus`, `a`.`LastMaintenanceDate` AS `LastMaintenanceDate`, `a`.`NextMaintenanceDate` AS `NextMaintenanceDate`, count(`mr`.`MaintenanceID`) AS `MaintenanceCount`, coalesce(sum(`mr`.`Cost`),0) AS `TotalMaintenanceCost` FROM (`assets` `a` left join `maintenancerecords` `mr` on(`a`.`AssetID` = `mr`.`AssetID`)) GROUP BY `a`.`AssetID` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`AssetID`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_assets_type` (`AssetType`),
  ADD KEY `idx_assets_status` (`MaintenanceStatus`);

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `idx_audit_user` (`UserID`);

--
-- Indexes for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD PRIMARY KEY (`MaintenanceID`),
  ADD KEY `TeamID` (`TeamID`),
  ADD KEY `idx_maintenance_asset` (`AssetID`),
  ADD KEY `idx_maintenance_date` (`MaintenanceDate`);

--
-- Indexes for table `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  ADD PRIMARY KEY (`ScheduleID`),
  ADD KEY `idx_schedules_asset` (`AssetID`),
  ADD KEY `idx_schedules_due` (`NextDueDate`);

--
-- Indexes for table `maintenanceteams`
--
ALTER TABLE `maintenanceteams`
  ADD PRIMARY KEY (`TeamID`),
  ADD UNIQUE KEY `TeamName` (`TeamName`);

--
-- Indexes for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD PRIMARY KEY (`MaintenanceID`),
  ADD KEY `AssetID` (`AssetID`),
  ADD KEY `TeamID` (`TeamID`);

--
-- Indexes for table `maintenance_teams`
--
ALTER TABLE `maintenance_teams`
  ADD PRIMARY KEY (`TeamID`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`ReportID`),
  ADD KEY `GeneratedBy` (`GeneratedBy`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `GoogleID` (`GoogleID`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`SessionID`),
  ADD UNIQUE KEY `unique_user_token` (`UserID`,`Token`),
  ADD KEY `idx_token` (`Token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `AssetID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  MODIFY `MaintenanceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  MODIFY `ScheduleID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenanceteams`
--
ALTER TABLE `maintenanceteams`
  MODIFY `TeamID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  MODIFY `MaintenanceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_teams`
--
ALTER TABLE `maintenance_teams`
  MODIFY `TeamID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `ReportID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `SessionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD CONSTRAINT `maintenancerecords_ibfk_1` FOREIGN KEY (`AssetID`) REFERENCES `assets` (`AssetID`),
  ADD CONSTRAINT `maintenancerecords_ibfk_2` FOREIGN KEY (`TeamID`) REFERENCES `maintenanceteams` (`TeamID`);

--
-- Constraints for table `maintenanceschedules`
--
ALTER TABLE `maintenanceschedules`
  ADD CONSTRAINT `maintenanceschedules_ibfk_1` FOREIGN KEY (`AssetID`) REFERENCES `assets` (`AssetID`);

--
-- Constraints for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD CONSTRAINT `maintenance_records_ibfk_1` FOREIGN KEY (`AssetID`) REFERENCES `assets` (`AssetID`),
  ADD CONSTRAINT `maintenance_records_ibfk_2` FOREIGN KEY (`TeamID`) REFERENCES `maintenance_teams` (`TeamID`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`GeneratedBy`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `cleanup_expired_sessions` ON SCHEDULE EVERY 1 HOUR STARTS '2025-03-21 15:46:20' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM user_sessions WHERE ExpiresAt < CURRENT_TIMESTAMP$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
