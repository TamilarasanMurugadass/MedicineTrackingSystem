using MedicineTracking.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class AuditLog : BaseEntity
{
    [Required]
    [StringLength(100)]
    public string TableName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;

    [Required]
    public AuditAction Action { get; set; }

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [StringLength(45)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    // Computed properties
    [NotMapped]
    public string ActionDisplayName => Action switch
    {
        AuditAction.INSERT => "Created",
        AuditAction.UPDATE => "Updated",
        AuditAction.DELETE => "Deleted",
        _ => Action.ToString()
    };
}