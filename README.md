# Medicine Usage Tracking System

A comprehensive web-based medicine inventory management and usage tracking system built for hospitals and healthcare facilities.

## Features

### Core Functionality
- **Medicine Management**: Add, edit, and organize medicine catalog with detailed information
- **Inventory Tracking**: Track medicine batches with expiry dates and stock levels
- **Usage Monitoring**: Record and analyze medicine usage patterns
- **Transaction History**: Complete audit trail of all inventory movements
- **Batch Management**: First Expiry First Out (FEFO) compliance
- **Automated Alerts**: Low stock and expiry notifications

### Analytics & Reporting
- **Usage Analytics**: Daily, weekly, and monthly usage patterns
- **Trend Analysis**: Usage trend identification and forecasting
- **Comprehensive Reports**: Multiple report formats with export capabilities
- **Interactive Dashboards**: Real-time insights and key metrics
- **Data Export**: CSV export functionality for external analysis

### Security & Access Control
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin, Pharmacist, and Staff roles
- **Audit Logging**: Complete activity tracking for compliance
- **Secure API**: RESTful API with proper authorization

## Technology Stack

### Backend
- **.NET 9 Web API**: Modern, high-performance API framework
- **Clean Architecture**: Maintainable and testable code structure
- **Entity Framework Core**: Object-relational mapping with MySQL
- **AutoMapper**: Object-to-object mapping
- **JWT Authentication**: Industry-standard security
- **MySQL Database**: Reliable and scalable data storage

### Frontend
- **React 18**: Modern, component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first responsive design framework
- **React Router**: Client-side routing
- **Custom Hooks**: Reusable state management and API integration
- **Responsive Design**: Mobile-friendly interface

## Project Structure

```
MedicineTrackingSystem/
├── Backend/
│   ├── MedicineTracking.Api/           # Web API controllers and startup
│   ├── MedicineTracking.Application/   # Business logic and services
│   ├── MedicineTracking.Domain/        # Domain models and entities
│   └── MedicineTracking.Infrastructure/ # Data access and external services
├── frontend/                           # React application
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   ├── pages/                      # Page components
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── contexts/                   # React context providers
│   │   └── types/                      # TypeScript type definitions
└── Database/
    └── Scripts/                        # Database setup scripts
```

## Prerequisites

- **Node.js** (v18 or later)
- **npm** (v8 or later)
- **.NET 9 SDK**
- **MySQL** (v8.0 or later)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MedicineTrackingSystem
```

### 2. Database Setup

1. **Install MySQL** and ensure it's running
2. **Create Database**:
   ```bash
   mysql -u root -p
   CREATE DATABASE MedicineTrackingDB;
   exit
   ```

3. **Run Database Scripts**:
   ```bash
   mysql -u root -p MedicineTrackingDB < Database/Scripts/01_CreateDatabase.sql
   ```

### 3. Backend Setup

1. **Navigate to Backend Directory**:
   ```bash
   cd Backend/MedicineTracking.Api
   ```

2. **Install Dependencies**:
   ```bash
   dotnet restore
   ```

3. **Update Connection String**:
   - Open `appsettings.json`
   - Update the MySQL connection string with your credentials:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Port=3306;Database=MedicineTrackingDB;Uid=your_username;Pwd=your_password;"
     }
   }
   ```

4. **Run Database Migrations** (if using Entity Framework migrations):
   ```bash
   dotnet ef database update
   ```

5. **Start the API**:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:7001` and `http://localhost:5000`

### 4. Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd ../../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Default Login Credentials

The system creates a default admin user during database seeding:

- **Username**: admin@medicinetracking.com
- **Password**: Admin123!
- **Role**: Administrator

## Configuration

### Backend Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=MedicineTrackingDB;Uid=root;Pwd=password;"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long",
    "Issuer": "MedicineTrackingAPI",
    "Audience": "MedicineTrackingClient",
    "ExpiryInHours": 24
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Frontend Configuration

The frontend automatically connects to the backend API. If you need to change the API URL, update the base URL in the API configuration files.

## Usage Guide

### 1. First Login
1. Open the application at `http://localhost:3000`
2. Login with the default admin credentials
3. Change the default password immediately

### 2. Medicine Management
1. Navigate to **Medicines** from the sidebar
2. Click **Add Medicine** to add new medicines
3. Fill in required information: name, category, unit, description
4. Medicines appear in the list and are available for inventory operations

### 3. Inventory Management
1. Navigate to **Inventory** from the sidebar
2. Click **Add Batch** to add medicine batches
3. Select medicine, enter batch number, quantities, and expiry date
4. Use action buttons to:
   - **Withdraw**: Remove medicine for usage
   - **Adjust**: Correct stock levels
   - **Edit**: Modify batch information
   - **Mark Expired**: Handle expired medicines

### 4. Usage Tracking
1. Navigate to **Usage Tracking** for analytics
2. View usage patterns, trends, and insights
3. Use date filters to analyze specific periods
4. Export data for external analysis

### 5. Transaction History
1. Navigate to **Transactions** to view all inventory movements
2. Search and filter transactions by medicine, user, or reason
3. View complete audit trail for compliance

### 6. Reports & Analytics
1. Navigate to **Reports** for comprehensive reporting
2. Choose from different report types:
   - Usage Analysis
   - Inventory Status
   - Transaction Summary
   - Expiry Forecast
3. Export reports in CSV format

## User Roles & Permissions

### Administrator
- Full system access
- User management
- System configuration
- All inventory operations
- Report generation

### Pharmacist
- Medicine and inventory management
- Usage tracking and reporting
- Transaction management
- Limited user operations

### Staff
- Basic inventory viewing
- Medicine usage recording
- Limited reporting access

## API Documentation

The API provides RESTful endpoints for all system operations:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)

### Medicines
- `GET /api/medicines` - List all medicines
- `POST /api/medicines` - Create new medicine
- `PUT /api/medicines/{id}` - Update medicine
- `DELETE /api/medicines/{id}` - Delete medicine

### Medicine Batches
- `GET /api/medicinebatches` - List all batches
- `POST /api/medicinebatches` - Create new batch
- `PUT /api/medicinebatches/{id}` - Update batch
- `DELETE /api/medicinebatches/{id}` - Delete batch

### Inventory Transactions
- `GET /api/inventory/transactions` - List transactions
- `POST /api/inventory/withdraw` - Withdraw medicine
- `POST /api/inventory/adjust-stock` - Adjust stock
- `POST /api/inventory/mark-expired` - Mark as expired
- `POST /api/inventory/mark-damaged` - Mark as damaged

## Development

### Backend Development
```bash
cd Backend/MedicineTracking.Api
dotnet watch run
```

### Frontend Development
```bash
cd frontend
npm start
```

### Database Migrations
```bash
cd Backend/MedicineTracking.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check connection string in `appsettings.json`
   - Ensure database exists and user has proper permissions

2. **Port Conflicts**:
   - Backend: Change ports in `launchSettings.json`
   - Frontend: Set `PORT` environment variable

3. **Authentication Issues**:
   - Verify JWT configuration
   - Check token expiry settings
   - Ensure CORS is properly configured

4. **Build Errors**:
   - Run `dotnet clean` and `dotnet restore` for backend
   - Delete `node_modules` and run `npm install` for frontend

### Log Files
- Backend logs: Console output and configured log files
- Frontend logs: Browser developer console

## Production Deployment

### Backend Deployment
1. **Build Release**:
   ```bash
   dotnet publish -c Release
   ```

2. **Configure Production Settings**:
   - Update connection strings
   - Set appropriate JWT secrets
   - Configure HTTPS
   - Set up reverse proxy (IIS/Nginx)

### Frontend Deployment
1. **Build Production Bundle**:
   ```bash
   npm run build
   ```

2. **Deploy Static Files**:
   - Deploy `build` folder to web server
   - Configure routing for single-page application

### Security Considerations
- Use HTTPS in production
- Implement proper CORS policies
- Use strong JWT secrets
- Regular security updates
- Database security hardening
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify configuration settings
4. Contact system administrator

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Version**: 1.0.0
**Last Updated**: 2024
**Developed by**: Medicine Tracking System Team