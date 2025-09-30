namespace MedicineTracking.Application.DTOs;

public class MedicineBatchDto
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public string? Supplier { get; set; }
    public int InitialQuantity { get; set; }
    public int CurrentQuantity { get; set; }
    public bool IsActive { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Computed properties
    public bool IsExpired { get; set; }
    public bool IsNearingExpiry { get; set; }
    public int DaysToExpiry { get; set; }
    public bool IsDepleted { get; set; }
    public decimal UsagePercentage { get; set; }
}

public class CreateMedicineBatchDto
{
    public int MedicineId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public string? Supplier { get; set; }
    public int InitialQuantity { get; set; }
}

public class UpdateMedicineBatchDto
{
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public string? Supplier { get; set; }
    public bool IsActive { get; set; }
}