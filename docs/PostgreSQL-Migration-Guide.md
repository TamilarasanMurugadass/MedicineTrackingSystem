# PostgreSQL Migration Guide
## Medicine Tracking System - MySQL to PostgreSQL Migration

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Instructions](#rollback-instructions)

---

## Overview

This document provides a complete guide for migrating the Medicine Tracking System from MySQL to PostgreSQL database. The migration includes updating database providers, connection strings, migrations, and table creation.

### What Changed
- Database Provider: MySQL → PostgreSQL
- EF Core Package: `Pomelo.EntityFrameworkCore.MySql` → `Npgsql.EntityFrameworkCore.PostgreSQL`
- Connection String Format: MySQL format → PostgreSQL format
- Database Migrations: Recreated for PostgreSQL

---

## Prerequisites

### Required Software
- ✅ .NET 9 SDK
- ✅ Docker Desktop (for PostgreSQL container)
- ✅ Entity Framework Core CLI tools

### Installation Steps

#### 1. Install EF Core Tools (if not already installed)
```bash
dotnet tool install --global dotnet-ef
```

Verify installation:
```bash
dotnet tool list -g
```

#### 2. Install PostgreSQL NuGet Package
```bash
cd Backend/MedicineTracking.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

#### 3. Start PostgreSQL Docker Container
Ensure your `docker-compose.yml` has PostgreSQL service configured:
```yaml
postgres:
  image: postgres:16
  container_name: postgres-local
  restart: unless-stopped
  environment:
    POSTGRES_DB: "MedicineTrackingDB"
    POSTGRES_USER: "drugapp"
    POSTGRES_PASSWORD: "Drugapp123!"
    TZ: "Asia/Kolkata"
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
```

Start the container:
```bash
docker-compose up -d postgres
```

Verify PostgreSQL is running:
```bash
docker ps --filter "name=postgres-local"
```

---

## Migration Steps

### Step 1: Update Database Configuration

**File:** `Backend/MedicineTracking.Infrastructure/Configuration/DatabaseConfiguration.cs`

**Change From:**
```csharp
services.AddDbContext<MedicineTrackingDbContext>(options =>
{
    // Use a fixed MySQL version instead of AutoDetect
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));

    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });

    // Enable sensitive data logging in development
    if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```

**Change To:**
```csharp
services.AddDbContext<MedicineTrackingDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
    });

    // Enable sensitive data logging in development
    if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```

**Key Changes:**
- Removed MySQL-specific server version configuration
- Changed `UseMySql()` to `UseNpgsql()`
- Updated retry configuration to match PostgreSQL provider signature

---

### Step 2: Update Connection Strings

#### Development Environment

**File:** `Backend/MedicineTracking.Api/appsettings.Development.json`

**Change From:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MedicineTrackingDB;User=drugapp;Password=Drugapp123!;ConvertZeroDateTime=True;"
  }
}
```

**Change To:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=MedicineTrackingDB;Username=drugapp;Password=Drugapp123!"
  }
}
```

**Key Differences:**
| MySQL Format | PostgreSQL Format |
|--------------|-------------------|
| `Server=` | `Host=` |
| `User=` | `Username=` |
| `ConvertZeroDateTime=True` | Not needed |
| Port implicit (3306) | `Port=5432` explicit |

#### Production Environment (if applicable)

Update your production connection string in environment variables or production configuration files using the same PostgreSQL format.

---

### Step 3: Build the Project

Ensure the project builds successfully with the new PostgreSQL provider:

```bash
cd Backend/MedicineTracking.Api
dotnet build
```

**Expected Output:**
```
Build succeeded.
3 Warning(s)
0 Error(s)
```

**Troubleshooting Build Errors:**

If you encounter:
```
error CS7036: There is no argument given that corresponds to the required parameter 'errorCodesToAdd'
```

Ensure you added `errorCodesToAdd: null` parameter in the `EnableRetryOnFailure()` method call in DatabaseConfiguration.cs.

---

### Step 4: Remove Existing MySQL Migrations

Remove old MySQL-specific migrations:

```bash
cd Backend/MedicineTracking.Api
dotnet ef migrations remove --project ../MedicineTracking.Infrastructure --force
```

**Expected Output:**
```
Removing migration '20251008065934_InitialCreate'.
Removing model snapshot.
Done.
```

**Important Notes:**
- This removes the migration files from your project
- If the migration was already applied to a MySQL database, this doesn't affect that database
- The `--force` flag is used because migrations may have been applied

---

### Step 5: Create New PostgreSQL Migration

Create a fresh migration for PostgreSQL:

```bash
cd Backend/MedicineTracking.Api
dotnet ef migrations add InitialPostgreSQLMigration --project ../MedicineTracking.Infrastructure
```

**Expected Output:**
```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

**What Gets Created:**
- `Migrations/[timestamp]_InitialPostgreSQLMigration.cs` - Migration file
- `Migrations/[timestamp]_InitialPostgreSQLMigration.Designer.cs` - Designer file
- `Migrations/MedicineTrackingDbContextModelSnapshot.cs` - Model snapshot

---

### Step 6: Apply Migration to Create Tables

Apply the migration to create all tables in PostgreSQL:

```bash
cd Backend/MedicineTracking.Api
dotnet ef database update --project ../MedicineTracking.Infrastructure
```

**Expected Output:**
```
Build started...
Build succeeded.
Acquiring an exclusive lock for migration application.
Applying migration '20251029130312_InitialPostgreSQLMigration'.
Done.
```

**What Happens:**
1. Entity Framework connects to PostgreSQL
2. Creates `__EFMigrationsHistory` table for tracking migrations
3. Executes all CREATE TABLE statements
4. Creates indexes, foreign keys, and constraints
5. Records the migration in history table

---

## Verification

### 1. Verify Tables in PostgreSQL

Connect to PostgreSQL and list all tables:

```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "\dt"
```

**Expected Output:**
```
                List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+---------
 public | Alerts                | table | drugapp
 public | AuditLogs             | table | drugapp
 public | IdentityRoles         | table | drugapp
 public | InventoryTransactions | table | drugapp
 public | MedicineBatches       | table | drugapp
 public | Medicines             | table | drugapp
 public | Reports               | table | drugapp
 public | RoleClaims            | table | drugapp
 public | Roles                 | table | drugapp
 public | UserClaims            | table | drugapp
 public | UserLogins            | table | drugapp
 public | UserRoles             | table | drugapp
 public | UserTokens            | table | drugapp
 public | Users                 | table | drugapp
 public | __EFMigrationsHistory | table | drugapp
(15 rows)
```

### 2. Check Migration History

```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "SELECT * FROM \"__EFMigrationsHistory\";"
```

### 3. View Table Structure

Check a specific table structure:

```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "\d+ Medicines"
```

### 4. Test API Connection

Start the API and verify database connectivity:

```bash
cd Backend/MedicineTracking.Api
dotnet run
```

Navigate to Swagger UI: `https://localhost:5001/swagger`

Try the authentication endpoints to verify database operations work correctly.

---

## Troubleshooting

### Issue 1: Connection Failed

**Error:**
```
Failed executing DbCommand: could not translate host name "localhost" to address
```

**Solution:**
- Verify PostgreSQL container is running: `docker ps`
- Check port 5432 is accessible: `netstat -an | findstr 5432`
- Restart PostgreSQL container: `docker restart postgres-local`

---

### Issue 2: Authentication Failed

**Error:**
```
password authentication failed for user "drugapp"
```

**Solution:**
- Verify credentials in connection string match docker-compose.yml
- Reset PostgreSQL container:
  ```bash
  docker-compose down -v
  docker-compose up -d postgres
  ```

---

### Issue 3: Migration Already Applied

**Error:**
```
The migration '20251029130312_InitialPostgreSQLMigration' has already been applied to the database.
```

**Solution:**
This is expected if you run `dotnet ef database update` multiple times. The migration is already applied successfully.

---

### Issue 4: Build Errors After Package Installation

**Error:**
```
error CS0234: The type or namespace name 'PostgreSQL' does not exist
```

**Solution:**
- Clean and rebuild:
  ```bash
  dotnet clean
  dotnet restore
  dotnet build
  ```

---

## Rollback Instructions

### To Revert to MySQL:

#### 1. Update DatabaseConfiguration.cs
Revert the database context configuration to use MySQL:

```csharp
services.AddDbContext<MedicineTrackingDbContext>(options =>
{
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));

    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });

    if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```

#### 2. Update Connection String
Revert `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MedicineTrackingDB;User=drugapp;Password=Drugapp123!;ConvertZeroDateTime=True;"
  }
}
```

#### 3. Remove PostgreSQL Migration
```bash
cd Backend/MedicineTracking.Api
dotnet ef migrations remove --project ../MedicineTracking.Infrastructure --force
```

#### 4. Create MySQL Migration
```bash
dotnet ef migrations add InitialMySQLMigration --project ../MedicineTracking.Infrastructure
```

#### 5. Apply to MySQL Database
```bash
# Start MySQL container
docker-compose up -d mysql

# Apply migration
dotnet ef database update --project ../MedicineTracking.Infrastructure
```

---

## Docker Compose Configuration

### Complete PostgreSQL Service Configuration

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16
    container_name: postgres-local
    restart: unless-stopped
    environment:
      POSTGRES_DB: "MedicineTrackingDB"
      POSTGRES_USER: "drugapp"
      POSTGRES_PASSWORD: "Drugapp123!"
      TZ: "Asia/Kolkata"
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drugapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: medicine-tracking-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=MedicineTrackingDB;Username=drugapp;Password=Drugapp123!
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres-data:
```

---

## Useful PostgreSQL Commands

### Connect to Database
```bash
docker exec -it postgres-local psql -U drugapp -d MedicineTrackingDB
```

### List All Databases
```bash
docker exec postgres-local psql -U drugapp -c "\l"
```

### List All Tables
```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "\dt"
```

### Describe Table Structure
```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "\d+ TableName"
```

### View Table Data
```bash
docker exec postgres-local psql -U drugapp -d MedicineTrackingDB -c "SELECT * FROM \"Users\" LIMIT 10;"
```

### Drop Database (CAUTION)
```bash
docker exec postgres-local psql -U drugapp -c "DROP DATABASE \"MedicineTrackingDB\";"
```

### Recreate Database
```bash
docker exec postgres-local psql -U drugapp -c "CREATE DATABASE \"MedicineTrackingDB\";"
```

---

## Database Schema Created

### Core Tables (15 Total)

#### Business Logic Tables
1. **Medicines** - Medicine catalog with categories and details
2. **MedicineBatches** - Inventory batches with expiry dates
3. **InventoryTransactions** - All inventory movements
4. **Alerts** - System notifications for low stock and expiry
5. **AuditLogs** - Activity tracking
6. **Reports** - Saved reports

#### Identity Tables (ASP.NET Core Identity)
7. **Users** - User accounts
8. **Roles** - User roles (Admin, Pharmacist, Staff)
9. **UserRoles** - User-to-role mappings
10. **UserClaims** - User-specific claims
11. **UserLogins** - External login providers
12. **UserTokens** - Authentication tokens
13. **RoleClaims** - Role-based claims
14. **IdentityRoles** - Additional role information

#### System Tables
15. **__EFMigrationsHistory** - Entity Framework migration tracking

---

## Performance Considerations

### PostgreSQL vs MySQL Differences

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| ACID Compliance | Yes | Yes (Stronger) |
| JSON Support | Limited | Native & Advanced |
| Full Text Search | Basic | Advanced |
| Concurrency | Row-level locking | MVCC (better) |
| Case Sensitivity | Configurable | Case-sensitive |
| String Comparison | Case-insensitive by default | Case-sensitive by default |

### Optimization Tips

1. **Connection Pooling** - Already configured in the connection string
2. **Retry Logic** - Configured with 5 retries, 30-second delay
3. **Indexes** - Review and add indexes for frequently queried columns
4. **Query Analysis** - Use `EXPLAIN ANALYZE` for slow queries

---

## Post-Migration Checklist

- ✅ PostgreSQL container running on port 5432
- ✅ Database provider updated to Npgsql
- ✅ Connection string updated to PostgreSQL format
- ✅ Old MySQL migrations removed
- ✅ New PostgreSQL migration created
- ✅ Migration applied successfully
- ✅ All 15 tables created in database
- ✅ API builds without errors
- ✅ API connects to PostgreSQL successfully
- ✅ Authentication endpoints tested
- ✅ Data operations verified

---

## Additional Resources

### Official Documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Npgsql Entity Framework Core Provider](https://www.npgsql.org/efcore/)
- [Entity Framework Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)

### Docker & PostgreSQL
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## Support & Contact

For issues or questions related to this migration:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review PostgreSQL logs: `docker logs postgres-local`
3. Review API logs in console output
4. Consult the project's CLAUDE.md documentation

---

**Document Version:** 1.0
**Last Updated:** October 29, 2025
**Migration Date:** October 29, 2025
**Status:** ✅ Completed Successfully
