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