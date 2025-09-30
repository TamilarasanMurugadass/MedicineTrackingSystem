namespace MedicineTracking.Application.DTOs;

public class DashboardStatsDto
{
    public int TotalMedicines { get; set; }
    public int ActiveMedicines { get; set; }
    public int LowStockMedicines { get; set; }
    public int TotalBatches { get; set; }
    public int ActiveBatches { get; set; }
    public int ExpiredBatches { get; set; }
    public int BatchesNearingExpiry { get; set; }
    public int TotalTransactionsToday { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalAlerts { get; set; }
    public int UnreadAlerts { get; set; }
}

public class StockSummaryDto
{
    public string MedicineName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public string Status { get; set; } = string.Empty; // "Normal", "Low", "Critical"
    public DateTime? EarliestExpiry { get; set; }
    public int ActiveBatches { get; set; }
}

public class RecentActivityDto
{
    public string ActivityType { get; set; } = string.Empty; // "Transaction", "Alert", "User Action"
    public string Description { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class ExpiryWarningDto
{
    public string MedicineName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public int DaysToExpiry { get; set; }
    public int CurrentQuantity { get; set; }
    public string Severity { get; set; } = string.Empty;
}