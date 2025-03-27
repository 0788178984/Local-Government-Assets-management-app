# Local Government Asset Management System

A comprehensive asset management system built with React Native, PHP, and MySQL, designed for local government asset tracking and maintenance management.

## Features

- 🏢 **Robust Asset Tracking**
  - Create, view, update, and delete assets
  - Track asset values and maintenance status
  - Detailed asset information capture

- 🔧 **Maintenance Management**
  - Schedule routine maintenance
  - Track maintenance history
  - Assign maintenance teams
  - Real-time status updates

- 📅 **Maintenance Scheduling**
  - Create maintenance schedules
  - View upcoming maintenance tasks
  - Track completed maintenance
  - Due maintenance alerts

- 👥 **Role-Based Access Control**
  - Admin access
  - Asset Manager role
  - Maintenance Team role
  - Secure authentication

## Tech Stack

- Frontend: React Native
- Backend: PHP
- Database: MySQL
- API: RESTful with JWT authentication

## Prerequisites

- Node.js and npm
- PHP 7.4 or higher
- MySQL 5.7 or higher
- XAMPP/WAMP/MAMP (for local development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LocalGovtAssetMgt_App
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up the Database**
   - Create a MySQL database named 'local_govt_assets'
   - Import the database schema:
   ```bash
   mysql -u root -p local_govt_assets < database/local_govt.sql
   ```

4. **Configure Backend**
   - Update database connection settings in `backend/config/database.php`
   - Ensure PHP is configured with MySQL PDO extension

5. **Start the Development Servers**
   - Start your local PHP server
   - Start the React Native development server:
   ```bash
   npm start
   ```

## Project Structure

```
LocalGovtAssetMgt_App/
├── frontend/
│   ├── screens/
│   │   ├── AssetManagement.js
│   │   ├── MaintenanceManagement.js
│   │   └── MaintenanceSchedule.js
│   ├── apiService.js
│   └── App.js
├── backend/
│   ├── api/
│   │   ├── login.php
│   │   └── register.php
│   └── config/
│       └── database.php
└── database/
    └── local_govt.sql
```

## Usage

1. **Authentication**
   - Use the login screen to access the system
   - Default admin credentials:
     - Email: admin@localgov.com
     - Password: password

2. **Asset Management**
   - Create new assets with detailed information
   - View all assets in a list
   - Update asset details and maintenance status
   - Delete assets when necessary

3. **Maintenance Management**
   - Create maintenance records for assets
   - Assign maintenance teams
   - Track maintenance costs and status
   - View maintenance history

4. **Maintenance Scheduling**
   - Create maintenance schedules for assets
   - View upcoming maintenance tasks
   - Track completed maintenance
   - Get alerts for due maintenance

## API Endpoints

The system provides a comprehensive set of API endpoints:

### Authentication
- POST `/api/login.php` - User login
- POST `/api/register.php` - User registration

### Assets
- GET `/api/assets/read.php` - Get all assets
- GET `/api/assets/read_one.php` - Get single asset
- POST `/api/assets/create.php` - Create new asset
- PUT `/api/assets/update.php` - Update asset
- DELETE `/api/assets/delete.php` - Delete asset

### Maintenance
- GET `/api/maintenance/read.php` - Get all maintenance records
- GET `/api/maintenance/read_by_asset.php` - Get maintenance by asset
- POST `/api/maintenance/create.php` - Create maintenance record
- PUT `/api/maintenance/update.php` - Update maintenance record
- DELETE `/api/maintenance/delete.php` - Delete maintenance record

### Schedules
- GET `/api/schedules/read.php` - Get all schedules
- GET `/api/schedules/get_due.php` - Get due maintenance
- POST `/api/schedules/create.php` - Create schedule
- PUT `/api/schedules/update.php` - Update schedule
- DELETE `/api/schedules/delete.php` - Delete schedule

## IP Address Configuration

When deploying the application or changing networks, you'll need to update the hardcoded IP addresses in the following files:

### Backend Files
1. `backend/api/config/core.php` (Line 12)
   ```php
   $issuer = "http://192.168.43.91/LocalGovtAssetMgt_App/";
   ```

2. `backend/api/test_connection.php` (Lines 61, 73, 75)
   ```php
   $suggestedUrls[] = "http://10.0.2.2/LocalGovtAssetMgt_App/backend/api"; // Android Emulator
   "3. If using an emulator, use the 10.0.2.2 URL",
   "5. Ensure Apache is listening on all interfaces (0.0.0.0:80)"
   ```

### Frontend Configuration Files
3. `src/config/config.js` (Lines 4-5)
   ```javascript
   API_URL: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/',
   API_URL_IP: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/',
   ```

4. `src/config/api.js` (Lines 4, 7, 12)
   ```javascript
   PRIMARY_URL: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api',
   ALTERNATE_URL: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api',
   IP: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api'
   ```

5. `src/services/api.js` (Line 8)
   ```javascript
   export const API_URL = 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/';
   ```

6. `frontend/apiService.js` (Line 4)
   ```javascript
   const API_BASE_URL = 'http://10.40.1.234/LocalGovtAssetMgt_App/backend/api';
   ```

### Screen Components with Direct API Calls
7. `src/screens/SettingsScreen.js` (Line 118)
   ```javascript
   uri: `http://192.168.43.91/LocalGovtAssetMgt_App/backend/uploads/${user.ProfilePhoto}`
   ```

8. `src/screens/EditProfileScreen.js` (Line 52)
   ```javascript
   'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/users/update_profile.php',
   ```

9. `src/screens/AddRecordScreen.js` (Lines 41, 54, 82)
   ```javascript
   const response = await fetch('http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/assets/read.php');
   const response = await fetch('http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/teams/read.php');
   const response = await fetch('http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/maintenance/create.php', {
   ```

### IP Addresses Used
- `192.168.43.91` - Most common, used in configuration files and direct API calls
- `10.40.1.234` - Used in frontend/apiService.js
- `10.0.2.2` - Used in test_connection.php (Android Emulator reference)
- `0.0.0.0` - Used in test_connection.php (Apache configuration reference)

When changing networks, ensure all these files are updated with the correct IP address to maintain proper connectivity.

## Security

- JWT-based authentication
- Role-based access control
- Password hashing
- Input validation and sanitization
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


login Derails-admin@localgov.com
password=password

for updating the ip address when it changes

  src/config/config.js

  Changed table name to maintenanceteams (lowercase) to match the actual table name in the database

  correct database to use is  local_govt_assets.sql  otherthan this one delete them they are confusing me.