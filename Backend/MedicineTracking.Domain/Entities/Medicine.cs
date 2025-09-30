using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class Medicine : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? GenericName { get; set; }

    [Required]
    [StringLength(200)]
    public string Manufacturer { get; set; } = string.Empty;

    public string? Description { get; set; }

    [StringLength(100)]
    public string? Strength { get; set; }

    [Required]
    [StringLength(50)]
    public string UnitOfMeasure { get; set; } = "pieces";

    public int MinimumStockLevel { get; set; } = 10;

    public bool IsActive { get; set; } = true;

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey(nameof(CreatedBy))]
    public virtual User Creator { get; set; } = null!;

    public virtual ICollection<MedicineBatch> MedicineBatches { get; set; } = new List<MedicineBatch>();
    public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();

    // Computed properties
    [NotMapped]
    public int TotalCurrentStock => MedicineBatches
        .Where(b => b.IsActive && b.CurrentQuantity > 0)
        .Sum(b => b.CurrentQuantity);

    [NotMapped]
    public bool IsLowStock => TotalCurrentStock <= MinimumStockLevel;

    [NotMapped]
    public DateTime? EarliestExpiry => MedicineBatches
        .Where(b => b.IsActive && b.CurrentQuantity > 0)
        .Min(b => (DateTime?)b.ExpiryDate);
}