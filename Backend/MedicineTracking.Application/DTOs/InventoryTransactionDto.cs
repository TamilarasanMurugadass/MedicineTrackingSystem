using MedicineTracking.Domain.Enums;

namespace MedicineTracking.Application.DTOs;

public class InventoryTransactionDto
{
    public int Id { get; set; }
    public int MedicineBatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public string MedicineName { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public string TransactionTypeDisplay { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int RemainingQuantity { get; set; }
    public string? Reason { get; set; }
    public string? PatientReference { get; set; }
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Computed properties
    public bool IsStockReduction { get; set; }
    public bool IsStockAddition { get; set; }
}

public class CreateInventoryTransactionDto
{
    public int MedicineBatchId { get; set; }
    public TransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public string? PatientReference { get; set; }
    public string? Notes { get; set; }
}

public class UsageSummaryDto
{
    public string MedicineName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int TotalQuantityUsed { get; set; }
    public int TransactionCount { get; set; }
    public DateTime FirstUsage { get; set; }
    public DateTime LastUsage { get; set; }
}