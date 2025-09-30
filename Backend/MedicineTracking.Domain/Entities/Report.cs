using MedicineTracking.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicineTracking.Domain.Entities;

public class Report : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string ReportName { get; set; } = string.Empty;

    [Required]
    public ReportType ReportType { get; set; }

    public string? Parameters { get; set; }

    [StringLength(500)]
    public string? FilePath { get; set; }

    [Required]
    public FileFormat FileFormat { get; set; }

    [Required]
    public string GeneratedBy { get; set; } = string.Empty;

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(GeneratedBy))]
    public virtual User Generator { get; set; } = null!;

    // Computed properties
    [NotMapped]
    public string ReportTypeDisplayName => ReportType switch
    {
        ReportType.STOCK => "Stock Report",
        ReportType.USAGE => "Usage Report",
        ReportType.EXPIRY => "Expiry Report",
        ReportType.DISCREPANCY => "Discrepancy Report",
        ReportType.AUDIT => "Audit Report",
        _ => ReportType.ToString()
    };

    [NotMapped]
    public string FileFormatDisplayName => FileFormat switch
    {
        FileFormat.PDF => "PDF",
        FileFormat.CSV => "CSV",
        FileFormat.EXCEL => "Excel",
        _ => FileFormat.ToString()
    };

    [NotMapped]
    public bool IsFileAvailable => !string.IsNullOrEmpty(FilePath) && File.Exists(FilePath);
}