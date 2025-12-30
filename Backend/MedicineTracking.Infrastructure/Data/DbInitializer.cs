using MedicineTracking.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MedicineTracking.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        MedicineTrackingDbContext context,
        UserManager<User> userManager,
        ILogger logger)
    {
        try
        {
            // Ensure database is created and migrations are applied
            await context.Database.MigrateAsync();

            // Check if admin user already exists
            var adminUser = await userManager.FindByEmailAsync("admin@medicinetracking.com");
            if (adminUser != null)
            {
                logger.LogInformation("Admin user already exists");
                return;
            }

            // Get the Admin role
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                logger.LogError("Admin role not found. Make sure roles are seeded first.");
                return;
            }

            // Create default admin user
            var newAdminUser = new User
            {
                UserName = "admin@medicinetracking.com",
                Email = "admin@medicinetracking.com",
                NormalizedUserName = "ADMIN@MEDICINETRACKING.COM",
                NormalizedEmail = "ADMIN@MEDICINETRACKING.COM",
                EmailConfirmed = true,
                FirstName = "System",
                LastName = "Administrator",
                RoleId = adminRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // Create user with password
            var result = await userManager.CreateAsync(newAdminUser, "Admin@123456");

            if (result.Succeeded)
            {
                logger.LogInformation("Default admin user created successfully");
                logger.LogInformation("Email: admin@medicinetracking.com");
                logger.LogInformation("Password: Admin@123456");
                logger.LogWarning("IMPORTANT: Change the default admin password after first login!");
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to create admin user: {Errors}", errors);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database");
            throw;
        }
    }
}
