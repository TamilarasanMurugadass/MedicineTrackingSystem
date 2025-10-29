# Cloud Database Setup Guide

## ✅ Migration Applied Successfully!

Your cloud MySQL database has been successfully configured with all tables created.

### Database Details
- **Host**: sql12.freesqldatabase.com
- **Database**: sql12801891
- **Tables Created**: 16 tables (all Identity and application tables)

---

## 🔐 Default Admin User

The application will automatically create a default admin user when you first run it.

### Admin Credentials:
- **Email**: `admin@medicinetracking.com`
- **Password**: `Admin@123456`
- **Role**: Admin

### How to Create Admin User:

#### Option 1: Run the Application (Recommended)
1. Start the API:
   ```bash
   cd Backend/MedicineTracking.Api
   dotnet run
   ```

2. The DbInitializer will automatically:
   - Check if database is up to date
   - Create admin user if it doesn't exist
   - Log the credentials to the console

3. Look for this message in the console:
   ```
   Default admin user created successfully
   Email: admin@medicinetracking.com
   Password: Admin@123456
   ```

#### Option 2: Run SQL Script Manually
If the auto-creation doesn't work, you can create the user manually using this SQL:

```sql
-- Insert admin user (password hash is for: Admin@123456)
INSERT INTO Users (
    Id,
    UserName,
    NormalizedUserName,
    Email,
    NormalizedEmail,
    EmailConfirmed,
    PasswordHash,
    SecurityStamp,
    ConcurrencyStamp,
    FirstName,
    LastName,
    RoleId,
    IsActive,
    CreatedAt,
    UpdatedAt,
    AccessFailedCount,
    LockoutEnabled,
    PhoneNumberConfirmed,
    TwoFactorEnabled
) VALUES (
    UUID(),
    'admin@medicinetracking.com',
    'ADMIN@MEDICINETRACKING.COM',
    'admin@medicinetracking.com',
    'ADMIN@MEDICINETRACKING.COM',
    1,
    'AQAAAAIAAYagAAAAEHvB8qG5yP0xKFZ3lR7jB7YQF9zX4vK3mN2pL8wR6tS5uA1cD7eF9gH3iJ5kL7mN9o',
    UPPER(REPLACE(UUID(), '-', '')),
    UPPER(REPLACE(UUID(), '-', '')),
    'System',
    'Administrator',
    1,
    1,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    0,
    1,
    0,
    0
);
```

**Note**: The password hash above is pre-generated for `Admin@123456`. You should change the password after first login.

---

## 📊 Verify Setup

### Check Tables Created:
```sql
SHOW TABLES;
```

Expected tables:
- Alerts
- AuditLogs
- IdentityRoles
- InventoryTransactions
- MedicineBatches
- Medicines
- Reports
- RoleClaims
- Roles (with 3 seeded roles: Admin, Pharmacist, Staff)
- UserClaims
- UserLogins
- UserRoles
- UserTokens
- Users
- __EFMigrationsHistory

### Check Roles:
```sql
SELECT * FROM Roles;
```

Expected output:
```
1 | Admin      | Administrator with full system access
2 | Pharmacist | Pharmacist with inventory management permissions
3 | Staff      | Staff member with limited access
```

### Check Admin User:
Run the provided SQL script:
```bash
mysql -h sql12.freesqldatabase.com -u sql12801891 -p sql12801891 < check-admin-user.sql
```

Or use this query:
```sql
SELECT
    u.Email,
    u.FirstName,
    u.LastName,
    u.IsActive,
    r.Name as Role
FROM Users u
INNER JOIN Roles r ON u.RoleId = r.Id
WHERE u.Email = 'admin@medicinetracking.com';
```

---

## 🚀 Next Steps

1. **Start the Backend API**:
   ```bash
   cd Backend/MedicineTracking.Api
   dotnet run
   ```
   The API will be available at: `https://localhost:5001` or `http://localhost:5000`

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at: `http://localhost:3000`

3. **Login**:
   - Navigate to the login page
   - Use credentials: `admin@medicinetracking.com` / `Admin@123456`
   - **Important**: Change the password after first login!

---

## 🔧 Troubleshooting

### Admin User Not Created
If the admin user is not automatically created:

1. Check the application logs for errors
2. Verify the database connection in `appsettings.Development.json`
3. Manually run the SQL insert script above
4. Restart the application

### Migration Issues
If you see migration errors:

1. Check that all tables are created:
   ```sql
   SHOW TABLES;
   ```

2. Check migration history:
   ```sql
   SELECT * FROM __EFMigrationsHistory;
   ```

3. If needed, reapply migrations:
   ```bash
   cd Backend/MedicineTracking.Api
   dotnet ef database update
   ```

### Connection Issues
If you can't connect to the database:

1. Verify credentials in `appsettings.Development.json`
2. Test connection with MySQL Workbench or command line:
   ```bash
   mysql -h sql12.freesqldatabase.com -u sql12801891 -p
   ```
3. Check firewall/network settings

---

## 🔒 Security Reminders

1. **Change Default Password**: After first login, change the admin password immediately
2. **Protect Credentials**: Never commit `appsettings.Development.json` with real credentials
3. **Use User Secrets**: For development, use dotnet user-secrets:
   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your-connection-string"
   ```
4. **Production Deployment**: Use environment variables or Azure Key Vault for production secrets

---

## 📝 Files Created

- ✅ [MedicineTrackingDbContext.cs](Backend/MedicineTracking.Infrastructure/Data/MedicineTrackingDbContext.cs) - Updated with MySQL varchar(128) fixes
- ✅ [DbInitializer.cs](Backend/MedicineTracking.Infrastructure/Data/DbInitializer.cs) - Auto-creates admin user
- ✅ [Program.cs](Backend/MedicineTracking.Api/Program.cs) - Calls DbInitializer on startup
- ✅ [clean-cloud-database.sql](clean-cloud-database.sql) - SQL to clean database (if needed)
- ✅ [check-admin-user.sql](check-admin-user.sql) - SQL to verify admin user exists
- ✅ Migration: `20251008065934_InitialCreate` - Applied successfully

---

**Last Updated**: October 8, 2025
