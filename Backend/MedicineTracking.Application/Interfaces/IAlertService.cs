using MedicineTracking.Application.DTOs;
using MedicineTracking.Domain.Enums;

namespace MedicineTracking.Application.Interfaces;

public interface IAlertService
{
    Task<IEnumerable<AlertDto>> GetAllAlertsAsync();
    Task<IEnumerable<AlertDto>> GetActiveAlertsAsync();
    Task<IEnumerable<AlertDto>> GetUnreadAlertsAsync();
    Task<IEnumerable<AlertDto>> GetAlertsByTypeAsync(AlertType type);
    Task<AlertDto?> GetAlertByIdAsync(int id);
    Task<AlertDto> CreateAlertAsync(CreateAlertDto createDto);
    Task<bool> MarkAlertAsReadAsync(int alertId, string userId);
    Task<bool> MarkAlertAsUnreadAsync(int alertId);
    Task<bool> DeactivateAlertAsync(int alertId, string userId);
    Task<AlertSummaryDto> GetAlertSummaryAsync();
    Task CheckAndCreateLowStockAlertsAsync();
    Task CheckAndCreateExpiryAlertsAsync(int daysAhead = 90);
    Task CheckAndCreateExpiredAlertsAsync();
    Task<bool> DeleteAlertAsync(int alertId);
}