# Medicine Tracking System - Project Documentation for Claude

## Project Overview
This is a comprehensive Medicine Usage Tracking System built for hospitals and healthcare facilities. It's a full-stack web application with a .NET 9 Web API backend and React 18 TypeScript frontend, designed for inventory management, usage tracking, and analytics of medical supplies.

## Technology Stack

### Backend (.NET 9)
- **Framework**: .NET 9 Web API
- **Architecture**: Clean Architecture (4-layer structure)
- **Database**: MySQL with Entity Framework Core 9.0.9
- **Authentication**: JWT Bearer tokens with ASP.NET Core Identity
- **Documentation**: Swagger/OpenAPI
- **Key Packages**:
  - Microsoft.AspNetCore.Authentication.JwtBearer v9.0.9
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore v9.0.9
  - Microsoft.EntityFrameworkCore.Design v9.0.9
  - Swashbuckle.AspNetCore v9.0.4

### Frontend (React 18)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router DOM v7.9.1
- **Forms**: React Hook Form v7.63.0 with Yup validation
- **HTTP Client**: Axios v1.12.2
- **Charts**: Chart.js v4.5.0 with react-chartjs-2
- **UI Components**: Custom component library with Headless UI
- **Notifications**: React Hot Toast v2.6.0

## Project Architecture

### Backend Structure (Clean Architecture)
```
Backend/
├── MedicineTracking.Api/           # Presentation Layer
│   ├── Controllers/                # API Controllers
│   ├── Extensions/                 # Service extensions
│   ├── Middleware/                 # Custom middleware
│   └── Program.cs                  # Application entry point
├── MedicineTracking.Application/   # Application Layer
│   ├── Configuration/              # Service configurations
│   ├── DTOs/                      # Data Transfer Objects
│   ├── Interfaces/                # Service interfaces
│   ├── Mappings/                  # AutoMapper profiles
│   ├── Services/                  # Business logic services
│   └── Validators/                # Input validation
├── MedicineTracking.Domain/        # Domain Layer
│   ├── Entities/                  # Domain entities
│   ├── Enums/                     # Domain enums
│   └── Interfaces/                # Domain interfaces
├── MedicineTracking.Infrastructure/ # Infrastructure Layer
│   ├── Configuration/             # EF configurations
│   ├── Data/                      # DbContext and migrations
│   ├── Repositories/              # Data access implementations
│   └── Services/                  # External service implementations
└── MedicineTracking.Tests/         # Test project
```

### Frontend Structure
```
frontend/src/
├── components/                     # Reusable UI components
│   ├── analytics/                 # Analytics-specific components
│   ├── auth/                      # Authentication components
│   ├── inventory/                 # Inventory management components
│   ├── layout/                    # Layout components (Header, Sidebar)
│   ├── medicine/                  # Medicine management components
│   ├── reports/                   # Reporting components
│   └── ui/                        # Base UI components (Button, Input, etc.)
├── config/                        # Configuration files
├── contexts/                      # React Context providers
├── hooks/                         # Custom React hooks
├── pages/                         # Page components
│   ├── auth/                      # Authentication pages
│   ├── dashboard/                 # Dashboard page
│   ├── inventory/                 # Inventory pages
│   ├── medicines/                 # Medicine management pages
│   ├── reports/                   # Reports pages
│   ├── transactions/              # Transaction history pages
│   └── usage/                     # Usage analytics pages
├── types/                         # TypeScript type definitions
└── utils/                         # Utility functions
```

## Core Features
1. **Medicine Management**: CRUD operations for medicines with categories and details
2. **Inventory Tracking**: Batch-based inventory with FEFO (First Expired First Out)
3. **Usage Analytics**: Comprehensive usage tracking with charts and trends
4. **Transaction History**: Complete audit trail of inventory movements
5. **Alerts System**: Automated low stock and expiry notifications
6. **Reports & Export**: Multiple report formats with CSV export
7. **Role-Based Access**: Admin, Pharmacist, and Staff roles
8. **Real-time Dashboard**: Key metrics and insights

## Development Standards & Conventions

### Backend Coding Standards

#### C# Conventions
- **Namespace Structure**: Follow project layer structure (Domain, Application, Infrastructure, Api)
- **Entity Naming**: PascalCase for all entities, properties, and methods
- **Base Entity**: All entities inherit from `BaseEntity` with `Id`, `CreatedAt`, `UpdatedAt`
- **Controller Pattern**:
  - All controllers inherit from `ControllerBase`
  - Use `[ApiController]` and `[Route("api/[controller]")]` attributes
  - Apply `[Authorize]` at controller level, specific roles at action level
  - Consistent error handling with try-catch blocks
  - Proper logging with `ILogger<T>`
  - **IMPORTANT: ALL controller actions MUST return `ApiResponse<T>` wrapper** for consistent API responses
  - Use `ApiResponse<T>.SuccessResponse()` for successful operations
  - Use `ApiResponse<T>.ErrorResponse()` for error responses
  - Use `ApiResponse<T>.CreatedResponse()` for resource creation

#### Example Controller Pattern:
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicinesController : ControllerBase
{
    private readonly IMedicineService _medicineService;
    private readonly ILogger<MedicinesController> _logger;

    public MedicinesController(IMedicineService medicineService, ILogger<MedicinesController> logger)
    {
        _medicineService = medicineService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineDto>>>> GetAllMedicines()
    {
        try
        {
            var medicines = await _medicineService.GetAllMedicinesAsync();
            return Ok(ApiResponse<IEnumerable<MedicineDto>>.SuccessResponse(medicines, "Medicines retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all medicines");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineDto>>.ErrorResponse("An error occurred while retrieving medicines"));
        }
    }
}
```

#### Service Layer Patterns
- Use interfaces for all services
- Implement dependency injection
- Async/await for all database operations
- Proper error handling and logging
- DTOs for data transfer between layers

#### Entity Framework Conventions
- Use Entity Framework Core with MySQL
- Follow code-first approach
- Use proper navigation properties
- Implement repository pattern
- Use Unit of Work pattern

### Frontend Coding Standards

#### TypeScript Conventions
- **Component Structure**: Functional components with TypeScript interfaces
- **File Naming**: PascalCase for components, camelCase for utilities
- **Import Order**: External libraries → Internal components → Types → Utilities
- **Props Interface**: Always define interfaces for component props

#### Example Component Pattern:
```typescript
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  // Component implementation
};

export default Button;
```

#### Styling Conventions (Tailwind CSS)
- **Color System**: Use custom color palette (primary, success, warning, danger)
- **Component Classes**: Use `clsx` for conditional classes
- **Responsive Design**: Mobile-first approach with breakpoint prefixes
- **Design Tokens**: Consistent spacing, typography, and colors
- **Accessibility**: Proper focus states and ARIA attributes

#### Custom Color Palette:
```javascript
colors: {
  primary: { 50: '#eff6ff', 600: '#2563eb', 700: '#1d4ed8' },
  success: { 50: '#f0fdf4', 600: '#16a34a', 700: '#15803d' },
  warning: { 50: '#fffbeb', 600: '#d97706', 700: '#b45309' },
  danger: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' }
}
```

#### State Management Patterns
- Use React Context for global state
- Custom hooks for data fetching and business logic
- Local state for component-specific data
- Form state with React Hook Form

#### API Integration
- Centralized Axios configuration
- Custom hooks for API calls
- Proper error handling and loading states
- Token-based authentication

## Configuration Files

### Backend Configuration (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MedicineTrackingDB;User=root;Password=root;"
  },
  "JWT": {
    "SecretKey": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!",
    "Issuer": "MedicineTrackingAPI",
    "Audience": "MedicineTrackingClient"
  },
  "CORS": {
    "AllowedOrigins": ["https://yourdomain.com"]
  }
}
```

### Frontend Configuration
- Package.json with all dependencies
- Tailwind CSS configuration with custom theme
- TypeScript configuration for strict type checking

## Development Commands

### Backend Commands
```bash
# Navigate to API project
cd Backend/MedicineTracking.Api

# Restore packages
dotnet restore

# Run in development mode
dotnet run
# or watch mode
dotnet watch run

# Build for production
dotnet publish -c Release

# Entity Framework migrations
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Frontend Commands
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Authentication & Authorization

### JWT Configuration
- Bearer token authentication
- Role-based access control (Admin, Pharmacist, Staff)
- Token validation with issuer/audience verification
- Secure key storage in configuration

### User Roles & Permissions
- **Admin**: Full system access, user management
- **Pharmacist**: Medicine and inventory management, reporting
- **Staff**: Basic inventory viewing, usage recording

## Database Schema

### Core Entities
- `User`: User accounts with roles
- `Medicine`: Medicine catalog with categories
- `MedicineBatch`: Inventory batches with expiry dates
- `InventoryTransaction`: All inventory movements
- `Alert`: System notifications
- `AuditLog`: Activity tracking
- `Report`: Saved reports

### Relationships
- One-to-many between Medicine and MedicineBatch
- Many-to-one between transactions and users
- Audit trail for all operations

## Security Considerations

### Backend Security
- JWT token validation
- Role-based authorization
- Input validation and sanitization
- CORS policy configuration
- HTTPS enforcement in production

### Frontend Security
- Token storage in memory or secure storage
- Route protection based on roles
- Input validation with Yup schemas
- XSS protection with proper escaping

## Testing Strategy

### Backend Testing
- Unit tests for services and controllers
- Integration tests for API endpoints
- Database tests with test containers

### Frontend Testing
- Component unit tests with React Testing Library
- Integration tests for user flows
- E2E tests for critical paths

## Deployment Guidelines

### Production Deployment

#### Backend Deployment (Render)
- **Platform**: Render (https://render.com)
- **Service URL**: https://medicinetrackingsystem.onrender.com
- **Service ID**: srv-d3j14modl3ps73di28vg
- **MCP Integration**: Render MCP configured for deployment management
- **Configuration**:
  - Use production configuration
  - HTTPS enabled by default
  - Environment variables configured in Render dashboard
  - Auto-deploy enabled from Git repository

#### Frontend Deployment (Vercel)
- **Platform**: Vercel (https://vercel.com)
- **Application URL**: https://frontend-one-dun-jvngqh3yht.vercel.app
- **Configuration**:
  - Production bundle optimization enabled
  - SPA routing configured with rewrites
  - CDN distribution for static assets
  - Environment-specific variables configured
  - Auto-deploy enabled from Git repository

#### Production Database (Cloud MySQL)
- **Host**: sql12.freesqldatabase.com
- **Database Name**: sql12801891
- **Database User**: sql12801891
- **Database Password**: 6vdJf9E6W9
- **Port**: 3306
- **Connection String Format**:
  ```
  Server=sql12.freesqldatabase.com;Port=3306;Database=sql12801891;User=sql12801891;Password=6vdJf9E6W9
  ```

### Deployment Process

#### Backend Deployment Steps
1. Push code changes to Git repository
2. Render automatically detects changes and triggers build
3. Migrations run automatically on deployment
4. Service restarts with new version
5. Monitor deployment logs in Render dashboard

#### Frontend Deployment Steps
1. Push code changes to Git repository
2. Vercel automatically detects changes and triggers build
3. Production build optimized and deployed
4. CDN cache updated globally
5. Monitor deployment status in Vercel dashboard

### Environment Variables

#### Backend Environment Variables (Render)
- `ConnectionStrings__DefaultConnection`: Production database connection string
- `JWT__SecretKey`: Production JWT secret key
- `JWT__Issuer`: MedicineTrackingAPI
- `JWT__Audience`: MedicineTrackingClient
- `CORS__AllowedOrigins`: https://frontend-one-dun-jvngqh3yht.vercel.app
- `ASPNETCORE_ENVIRONMENT`: Production

#### Frontend Environment Variables (Vercel)
- `REACT_APP_API_URL`: https://medicinetrackingsystem.onrender.com
- `NODE_ENV`: production

## Code Quality Standards

### General Guidelines
- Follow SOLID principles
- Implement proper error handling
- Write meaningful commit messages
- Use consistent code formatting
- Document complex business logic
- Perform code reviews

### Performance Considerations
- Implement pagination for large datasets
- Use async/await for database operations
- Optimize frontend bundle size
- Implement proper caching strategies
- Monitor database query performance

## Maintenance Commands

### Backend Maintenance
```bash
# Check for updates
dotnet list package --outdated

# Update packages
dotnet add package PackageName --version x.x.x

# Clean build artifacts
dotnet clean
```

### Frontend Maintenance
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Audit security vulnerabilities
npm audit
npm audit fix
```

## Environment Setup Checklist

- [ ] .NET 9 SDK installed
- [ ] Node.js 18+ and npm installed
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed and configured
- [ ] IDE/Editor with C# and TypeScript support
- [ ] Database created and connection tested
- [ ] Environment variables configured
- [ ] Initial admin user created

This documentation provides a comprehensive guide for understanding and working with the Medicine Tracking System codebase.