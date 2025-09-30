using MedicineTracking.Domain.Enums;

namespace MedicineTracking.Application.DTOs;

public class AlertDto
{
    public int Id { get; set; }
    public AlertType AlertType { get; set; }
    public string AlertTypeDisplay { get; set; } = string.Empty;
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public int? MedicineBatchId { get; set; }
    public string? BatchNumber { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int? CurrentStock { get; set; }
    public int? MinimumStock { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ReadBy { get; set; }
    public string? ReaderName { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class CreateAlertDto
{
    public AlertType AlertType { get; set; }
    public int MedicineId { get; set; }
    public int? MedicineBatchId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public int? CurrentStock { get; set; }
    public int? MinimumStock { get; set; }
}

public class AlertSummaryDto
{
    public int TotalAlerts { get; set; }
    public int UnreadAlerts { get; set; }
    public int HighSeverityAlerts { get; set; }
    public int MediumSeverityAlerts { get; set; }
    public int LowSeverityAlerts { get; set; }
    public int LowStockAlerts { get; set; }
    public int ExpiryAlerts { get; set; }
    public int ExpiredAlerts { get; set; }
}