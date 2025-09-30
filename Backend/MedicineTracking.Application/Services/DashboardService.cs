using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Enums;
using MedicineTracking.Domain.Interfaces;

namespace MedicineTracking.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var medicines = await _unitOfWork.Medicines.GetAllAsync();
        var batches = await _unitOfWork.MedicineBatches.GetAllAsync();
        var users = await _unitOfWork.Users.GetAllAsync();
        var alerts = await _unitOfWork.Alerts.GetAllAsync();

        var today = DateTime.UtcNow.Date;
        var todayTransactions = await _unitOfWork.InventoryTransactions.CountAsync(t => t.CreatedAt.Date == today);

        var activeMedicines = medicines.Where(m => m.IsActive);
        var lowStockMedicines = activeMedicines.Where(m => m.IsLowStock);

        var activeBatches = batches.Where(b => b.IsActive && b.CurrentQuantity > 0);
        var expiredBatches = batches.Where(b => b.IsActive && b.ExpiryDate < DateTime.UtcNow.Date);
        var nearingExpiry = batches.Where(b => b.IsActive &&
                                         b.CurrentQuantity > 0 &&
                                         b.ExpiryDate <= DateTime.UtcNow.AddDays(30));

        var activeAlerts = alerts.Where(a => a.IsActive);

        return new DashboardStatsDto
        {
            TotalMedicines = medicines.Count(),
            ActiveMedicines = activeMedicines.Count(),
            LowStockMedicines = lowStockMedicines.Count(),
            TotalBatches = batches.Count(),
            ActiveBatches = activeBatches.Count(),
            ExpiredBatches = expiredBatches.Count(),
            BatchesNearingExpiry = nearingExpiry.Count(),
            TotalTransactionsToday = todayTransactions,
            TotalUsers = users.Count(),
            ActiveUsers = users.Count(u => u.IsActive),
            TotalAlerts = activeAlerts.Count(),
            UnreadAlerts = activeAlerts.Count(a => !a.IsRead)
        };
    }

    public async Task<IEnumerable<StockSummaryDto>> GetStockSummaryAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);

        return medicines.Select(m => new StockSummaryDto
        {
            MedicineName = m.Name,
            CurrentStock = m.TotalCurrentStock,
            MinimumStock = m.MinimumStockLevel,
            Status = GetStockStatus(m.TotalCurrentStock, m.MinimumStockLevel),
            EarliestExpiry = m.EarliestExpiry,
            ActiveBatches = m.MedicineBatches.Count(b => b.IsActive && b.CurrentQuantity > 0)
        }).OrderBy(s => s.Status).ThenBy(s => s.MedicineName);
    }

    public async Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(int count = 10)
    {
        var activities = new List<RecentActivityDto>();

        // Get recent transactions
        var recentTransactions = await _unitOfWork.InventoryTransactions.FindAsync(t =>
            t.CreatedAt >= DateTime.UtcNow.AddDays(-7));

        foreach (var transaction in recentTransactions.OrderByDescending(t => t.CreatedAt).Take(count / 2))
        {
            activities.Add(new RecentActivityDto
            {
                ActivityType = "Transaction",
                Description = $"{GetTransactionDescription(transaction.TransactionType)} - {transaction.MedicineBatch?.Medicine?.Name} (Qty: {transaction.Quantity})",
                UserName = transaction.Creator?.FullName ?? "Unknown",
                Timestamp = transaction.CreatedAt,
                Severity = GetTransactionSeverity(transaction.TransactionType)
            });
        }

        // Get recent alerts
        var recentAlerts = await _unitOfWork.Alerts.FindAsync(a =>
            a.CreatedAt >= DateTime.UtcNow.AddDays(-7) && a.IsActive);

        foreach (var alert in recentAlerts.OrderByDescending(a => a.CreatedAt).Take(count / 2))
        {
            activities.Add(new RecentActivityDto
            {
                ActivityType = "Alert",
                Description = alert.Message,
                UserName = "System",
                Timestamp = alert.CreatedAt,
                Severity = alert.Severity
            });
        }

        return activities.OrderByDescending(a => a.Timestamp).Take(count);
    }

    public async Task<IEnumerable<ExpiryWarningDto>> GetExpiryWarningsAsync(int daysAhead = 30)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.IsActive &&
            b.CurrentQuantity > 0 &&
            b.ExpiryDate <= cutoffDate &&
            b.ExpiryDate > DateTime.UtcNow.Date);

        return batches.Select(b => new ExpiryWarningDto
        {
            MedicineName = b.Medicine?.Name ?? "Unknown",
            BatchNumber = b.BatchNumber,
            ExpiryDate = b.ExpiryDate,
            DaysToExpiry = (b.ExpiryDate.Date - DateTime.UtcNow.Date).Days,
            CurrentQuantity = b.CurrentQuantity,
            Severity = GetExpirySeverity((b.ExpiryDate.Date - DateTime.UtcNow.Date).Days)
        }).OrderBy(w => w.DaysToExpiry);
    }

    public async Task<IEnumerable<StockSummaryDto>> GetCriticalStockItemsAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);
        var criticalItems = medicines.Where(m => m.TotalCurrentStock <= m.MinimumStockLevel);

        return criticalItems.Select(m => new StockSummaryDto
        {
            MedicineName = m.Name,
            CurrentStock = m.TotalCurrentStock,
            MinimumStock = m.MinimumStockLevel,
            Status = GetStockStatus(m.TotalCurrentStock, m.MinimumStockLevel),
            EarliestExpiry = m.EarliestExpiry,
            ActiveBatches = m.MedicineBatches.Count(b => b.IsActive && b.CurrentQuantity > 0)
        }).OrderBy(s => s.CurrentStock);
    }

    private static string GetStockStatus(int currentStock, int minimumStock)
    {
        if (currentStock == 0) return "Out of Stock";
        if (currentStock <= minimumStock * 0.5) return "Critical";
        if (currentStock <= minimumStock) return "Low";
        return "Normal";
    }

    private static string GetTransactionDescription(TransactionType type)
    {
        return type switch
        {
            TransactionType.IN => "Stock Added",
            TransactionType.OUT => "Medicine Dispensed",
            TransactionType.ADJUSTMENT => "Stock Adjusted",
            TransactionType.EXPIRED => "Expired Stock Removed",
            TransactionType.DAMAGED => "Damaged Stock Removed",
            _ => type.ToString()
        };
    }

    private static string GetTransactionSeverity(TransactionType type)
    {
        return type switch
        {
            TransactionType.EXPIRED => "High",
            TransactionType.DAMAGED => "Medium",
            TransactionType.OUT => "Low",
            TransactionType.IN => "Low",
            TransactionType.ADJUSTMENT => "Medium",
            _ => "Low"
        };
    }

    private static string GetExpirySeverity(int daysToExpiry)
    {
        return daysToExpiry switch
        {
            <= 7 => "High",
            <= 30 => "Medium",
            _ => "Low"
        };
    }
}