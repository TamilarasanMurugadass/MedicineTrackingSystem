namespace MedicineTracking.Application.DTOs;

public class MedicineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string Manufacturer { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Strength { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public int MinimumStockLevel { get; set; }
    public bool IsActive { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Computed properties
    public int TotalCurrentStock { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime? EarliestExpiry { get; set; }
    public int ActiveBatches { get; set; }
}

public class CreateMedicineDto
{
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string Manufacturer { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Strength { get; set; }
    public string UnitOfMeasure { get; set; } = "pieces";
    public int MinimumStockLevel { get; set; } = 10;
}

public class UpdateMedicineDto
{
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string Manufacturer { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Strength { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public int MinimumStockLevel { get; set; }
    public bool IsActive { get; set; }
}