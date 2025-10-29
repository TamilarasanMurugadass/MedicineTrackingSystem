# Render Deployment Guide for Medicine Tracking System

## Prerequisites

Before deploying to Render, you need:

1. A MySQL database (can be from any cloud provider like PlanetScale, AWS RDS, Azure Database for MySQL, etc.)
2. A GitHub repository with your code
3. A Render account

## Database Setup Options

### Option 1: PlanetScale (Recommended - Free Tier Available)

1. Sign up at https://planetscale.com
2. Create a new database
3. Get the connection string in MySQL format
4. Connection string format:
   ```
   Server=YOUR_HOST;Database=YOUR_DATABASE;User=YOUR_USERNAME;Password=YOUR_PASSWORD;SslMode=Required;
   ```

### Option 2: AWS RDS MySQL

1. Create an RDS MySQL instance
2. Configure security groups to allow connections from anywhere (0.0.0.0/0) or Render's IP ranges
3. Get the connection string

### Option 3: Azure Database for MySQL

1. Create an Azure Database for MySQL instance
2. Configure firewall rules
3. Get the connection string

### Option 4: Railway MySQL

1. Sign up at https://railway.app
2. Create a new MySQL database
3. Get the connection string from the database settings

## Render Service Configuration

### Step 1: Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: MedicineTrackingSystem
   - **Root Directory**: `Backend/`
   - **Environment**: Docker
   - **Region**: Oregon (or your preferred region)
   - **Branch**: Your deployment branch (e.g., `main` or `mysql-cloud-deploy/branch/#demo`)
   - **Dockerfile Path**: `./Dockerfile`

### Step 2: Set Environment Variables

In the Render dashboard, go to your service → Environment tab and add:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | Your MySQL connection string | **REQUIRED** - MySQL connection string |
| `JWT__SecretKey` | Your JWT secret (min 32 chars) | Secret key for JWT token generation |
| `JWT__Issuer` | `MedicineTrackingAPI` | JWT token issuer |
| `JWT__Audience` | `MedicineTrackingClient` | JWT token audience |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Environment setting |
| `CORS__AllowedOrigins__0` | Your frontend URL | Frontend URL for CORS (e.g., `https://yourdomain.com`) |

**Important MySQL Connection String Format:**

```
Server=YOUR_HOST;Port=3306;Database=YOUR_DATABASE;User=YOUR_USERNAME;Password=YOUR_PASSWORD;SslMode=Required;ConvertZeroDateTime=True;
```

**Example for PlanetScale:**
```
Server=aws.connect.psdb.cloud;Database=medicinetracking;User=your-username;Password=pscale_pw_xxxxx;SslMode=VerifyFull;ConvertZeroDateTime=True;
```

**Note:** Make sure to replace spaces with no spaces in connection string parameters (e.g., use `ConvertZeroDateTime` instead of `Convert Zero Datetime`).

### Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the deployment logs for any issues

## Deployment Fixes Applied

The following fixes have been applied to resolve deployment issues:

### 1. Connection String Parsing Fix

- **Problem**: The original connection string had `Convert Zero Datetime=True` which caused parsing errors due to the space in the parameter name.
- **Solution**: Changed to `ConvertZeroDateTime=True` (no spaces)
- **File**: `Backend/MedicineTracking.Api/appsettings.json`

### 2. MySQL Server Version Auto-Detection Fix

- **Problem**: `ServerVersion.AutoDetect()` tried to connect to the database during startup configuration, which failed with malformed connection strings.
- **Solution**: Use a fixed `MySqlServerVersion(new Version(8, 0, 21))` to avoid connection attempts during configuration.
- **File**: `Backend/MedicineTracking.Infrastructure/Configuration/DatabaseConfiguration.cs`

### 3. Environment Variable Support

- **Problem**: No support for cloud environment variables for database connection.
- **Solution**: Added support for `DATABASE_URL` environment variable with fallback to `appsettings.json`.
- **File**: `Backend/MedicineTracking.Infrastructure/Configuration/DatabaseConfiguration.cs`

```csharp
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                      ?? configuration.GetConnectionString("DefaultConnection");
```

## Troubleshooting

### Issue: "Format of the initialization string does not conform to specification"

**Cause**: Connection string has invalid format or special characters.

**Solution**:
- Ensure no spaces in parameter names (e.g., `ConvertZeroDateTime` not `Convert Zero Datetime`)
- Ensure all special characters in password are properly URL-encoded or escaped
- Use the exact format shown above

### Issue: "Database connection string is not configured"

**Cause**: Neither `DATABASE_URL` environment variable nor `DefaultConnection` in appsettings is set.

**Solution**:
- Set the `DATABASE_URL` environment variable in Render dashboard
- Ensure the connection string is valid and not empty

### Issue: Database migrations not applied

**Cause**: The application runs migrations on startup, but the database might not be accessible.

**Solution**:
1. Verify database firewall rules allow connections from Render
2. Check that the connection string is correct
3. Manually apply migrations using:
   ```bash
   dotnet ef database update --project Backend/MedicineTracking.Infrastructure --startup-project Backend/MedicineTracking.Api
   ```

### Issue: SSL/TLS connection errors

**Cause**: Some cloud databases require SSL connections.

**Solution**:
- Add `SslMode=Required` or `SslMode=VerifyFull` to your connection string
- For PlanetScale, use `SslMode=VerifyFull`

## Post-Deployment

### 1. Verify Deployment

Visit your Render service URL (e.g., `https://medicinetrackingsystem.onrender.com`)

### 2. Check Health

Access the Swagger UI (if enabled in production):
- `https://your-service.onrender.com/swagger`

### 3. Test API

Use the API endpoints:
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get JWT token

### 4. Monitor Logs

Check Render logs for any runtime errors:
- Go to Render Dashboard → Your Service → Logs

## Database Schema Initialization

The application automatically:
1. Applies pending migrations on startup
2. Seeds default admin user:
   - **Username**: admin@medicinetracking.com
   - **Password**: Admin@123
   - **Role**: Admin

## Security Considerations

1. **Change default admin password** after first deployment
2. **Use strong JWT secret** (minimum 32 characters, random)
3. **Configure proper CORS origins** (not `*` in production)
4. **Use environment variables** for all secrets (never commit to git)
5. **Enable SSL/TLS** for database connections
6. **Restrict database access** to Render IP ranges if possible

## Cost Optimization

- **Render Free Tier**: Services spin down after 15 minutes of inactivity
- **Database**: Consider free tiers (PlanetScale has 1 database free)
- **Monitoring**: Use Render's built-in logging and metrics

## Next Steps

1. Set up a custom domain (optional)
2. Configure frontend deployment
3. Set up CI/CD for automatic deployments
4. Configure environment-specific settings
5. Set up monitoring and alerting

## Support

For issues related to:
- **Render**: https://render.com/docs
- **MySQL**: Your database provider's documentation
- **Application**: Check application logs in Render dashboard
