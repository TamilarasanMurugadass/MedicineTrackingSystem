using MedicineTracking.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class Alert : BaseEntity
{
    [Required]
    public AlertType AlertType { get; set; }

    [Required]
    public int MedicineId { get; set; }

    public int? MedicineBatchId { get; set; }

    [Required]
    [StringLength(500)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public DateTime? ExpiryDate { get; set; }

    public int? CurrentStock { get; set; }

    public int? MinimumStock { get; set; }

    public DateTime? ReadAt { get; set; }

    public string? ReadBy { get; set; }

    // Navigation properties
    [ForeignKey(nameof(MedicineId))]
    public virtual Medicine Medicine { get; set; } = null!;

    [ForeignKey(nameof(MedicineBatchId))]
    public virtual MedicineBatch? MedicineBatch { get; set; }

    [ForeignKey(nameof(ReadBy))]
    public virtual User? Reader { get; set; }

    // Computed properties
    [NotMapped]
    public string AlertTypeDisplayName => AlertType switch
    {
        AlertType.LOW_STOCK => "Low Stock",
        AlertType.EXPIRY_WARNING => "Expiry Warning",
        AlertType.EXPIRED => "Expired",
        AlertType.BATCH_DEPLETED => "Batch Depleted",
        _ => AlertType.ToString()
    };

    [NotMapped]
    public string Severity => AlertType switch
    {
        AlertType.EXPIRED => "High",
        AlertType.LOW_STOCK => "Medium",
        AlertType.EXPIRY_WARNING => "Medium",
        AlertType.BATCH_DEPLETED => "Low",
        _ => "Low"
    };
}