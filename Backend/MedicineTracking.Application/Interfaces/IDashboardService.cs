using MedicineTracking.Application.DTOs;

namespace MedicineTracking.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<IEnumerable<StockSummaryDto>> GetStockSummaryAsync();
    Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(int count = 10);
    Task<IEnumerable<ExpiryWarningDto>> GetExpiryWarningsAsync(int daysAhead = 30);
    Task<IEnumerable<StockSummaryDto>> GetCriticalStockItemsAsync();
}