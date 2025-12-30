using MedicineTracking.Domain.Interfaces;
using MedicineTracking.Infrastructure.Data;
using MedicineTracking.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MedicineTracking.Infrastructure.Configuration;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        // Try to get connection string from environment variable first (for cloud deployments like Render)
        // Then fall back to configuration
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                              ?? configuration.GetConnectionString("DefaultConnection");

        // Validate connection string
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Database connection string is not configured. " +
                "Please set the 'DATABASE_URL' environment variable or configure 'DefaultConnection' in appsettings.json");
        }

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

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Register specialized repositories
        services.AddScoped<MedicineRepository>();
        services.AddScoped<MedicineBatchRepository>();

        return services;
    }
}