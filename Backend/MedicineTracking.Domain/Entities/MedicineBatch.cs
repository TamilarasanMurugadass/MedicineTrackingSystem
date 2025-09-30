using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class MedicineBatch : BaseEntity
{
    [Required]
    public int MedicineId { get; set; }

    [Required]
    [StringLength(100)]
    public string BatchNumber { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiryDate { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? PurchasePrice { get; set; }

    [StringLength(200)]
    public string? Supplier { get; set; }

    [Required]
    public int InitialQuantity { get; set; }

    [Required]
    public int CurrentQuantity { get; set; }

    public bool IsActive { get; set; } = true;

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey(nameof(MedicineId))]
    public virtual Medicine Medicine { get; set; } = null!;

    [ForeignKey(nameof(CreatedBy))]
    public virtual User Creator { get; set; } = null!;

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();

    // Computed properties
    [NotMapped]
    public bool IsExpired => DateTime.UtcNow.Date > ExpiryDate.Date;

    [NotMapped]
    public bool IsNearingExpiry => (ExpiryDate.Date - DateTime.UtcNow.Date).TotalDays <= 90;

    [NotMapped]
    public int DaysToExpiry => (int)(ExpiryDate.Date - DateTime.UtcNow.Date).TotalDays;

    [NotMapped]
    public bool IsDepleted => CurrentQuantity <= 0;

    [NotMapped]
    public decimal UsagePercentage => InitialQuantity > 0 ?
        ((decimal)(InitialQuantity - CurrentQuantity) / InitialQuantity) * 100 : 0;
}