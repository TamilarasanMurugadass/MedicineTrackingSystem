using MedicineTracking.Application.Interfaces;
using MedicineTracking.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MedicineTracking.Application.Configuration;

public static class ApplicationConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register AutoMapper
        services.AddAutoMapper(typeof(ApplicationConfiguration).Assembly);

        // Register application services
        services.AddScoped<IMedicineService, MedicineService>();
        services.AddScoped<IMedicineBatchService, MedicineBatchService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IAlertService, AlertService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}