using MedicineTracking.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class InventoryTransaction : BaseEntity
{
    [Required]
    public int MedicineBatchId { get; set; }

    [Required]
    public TransactionType TransactionType { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    public int RemainingQuantity { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    [StringLength(100)]
    public string? PatientReference { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey(nameof(MedicineBatchId))]
    public virtual MedicineBatch MedicineBatch { get; set; } = null!;

    [ForeignKey(nameof(CreatedBy))]
    public virtual User Creator { get; set; } = null!;

    // Computed properties
    [NotMapped]
    public bool IsStockReduction => TransactionType == TransactionType.OUT ||
                                   TransactionType == TransactionType.EXPIRED ||
                                   TransactionType == TransactionType.DAMAGED ||
                                   (TransactionType == TransactionType.ADJUSTMENT && Quantity < 0);

    [NotMapped]
    public bool IsStockAddition => TransactionType == TransactionType.IN ||
                                  (TransactionType == TransactionType.ADJUSTMENT && Quantity > 0);
}