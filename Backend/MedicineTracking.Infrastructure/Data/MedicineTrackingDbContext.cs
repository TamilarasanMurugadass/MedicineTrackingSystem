using MedicineTracking.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MedicineTracking.Infrastructure.Data;

public class MedicineTrackingDbContext : IdentityDbContext<User>
{
    public MedicineTrackingDbContext(DbContextOptions<MedicineTrackingDbContext> options)
        : base(options)
    {
    }

    public new DbSet<Role> Roles { get; set; }
    public DbSet<Medicine> Medicines { get; set; }
    public DbSet<MedicineBatch> MedicineBatches { get; set; }
    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Report> Reports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure ASP.NET Identity table names (remove AspNet prefix)
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("IdentityRoles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");

        // Note: Using custom Role entity alongside IdentityRole for different purposes

        // Configure Role entity
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(u => u.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(u => u.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Medicine entity
        modelBuilder.Entity<Medicine>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.GenericName);
            entity.HasIndex(e => e.Manufacturer);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(m => m.Creator)
                  .WithMany(u => u.CreatedMedicines)
                  .HasForeignKey(m => m.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure MedicineBatch entity
        modelBuilder.Entity<MedicineBatch>(entity =>
        {
            entity.HasIndex(e => new { e.MedicineId, e.BatchNumber }).IsUnique();
            entity.HasIndex(e => e.ExpiryDate);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.CurrentQuantity);

            entity.HasOne(mb => mb.Medicine)
                  .WithMany(m => m.MedicineBatches)
                  .HasForeignKey(mb => mb.MedicineId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(mb => mb.Creator)
                  .WithMany(u => u.CreatedMedicineBatches)
                  .HasForeignKey(mb => mb.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure InventoryTransaction entity
        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasIndex(e => e.TransactionType);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.MedicineBatchId);
            entity.HasIndex(e => e.CreatedBy);

            entity.HasOne(it => it.MedicineBatch)
                  .WithMany(mb => mb.InventoryTransactions)
                  .HasForeignKey(it => it.MedicineBatchId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(it => it.Creator)
                  .WithMany(u => u.InventoryTransactions)
                  .HasForeignKey(it => it.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Alert entity
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.HasIndex(e => e.AlertType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsRead);
            entity.HasIndex(e => e.MedicineId);

            entity.HasOne(a => a.Medicine)
                  .WithMany(m => m.Alerts)
                  .HasForeignKey(a => a.MedicineId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.MedicineBatch)
                  .WithMany(mb => mb.Alerts)
                  .HasForeignKey(a => a.MedicineBatchId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(a => a.Reader)
                  .WithMany(u => u.ReadAlerts)
                  .HasForeignKey(a => a.ReadBy)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure AuditLog entity
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(e => e.TableName);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Action);

            entity.HasOne(al => al.User)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(al => al.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Report entity
        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasIndex(e => e.ReportType);
            entity.HasIndex(e => e.GeneratedAt);
            entity.HasIndex(e => e.GeneratedBy);

            entity.HasOne(r => r.Generator)
                  .WithMany(u => u.GeneratedReports)
                  .HasForeignKey(r => r.GeneratedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure enum conversions
        modelBuilder.Entity<InventoryTransaction>()
            .Property(e => e.TransactionType)
            .HasConversion<string>();

        modelBuilder.Entity<Alert>()
            .Property(e => e.AlertType)
            .HasConversion<string>();

        modelBuilder.Entity<AuditLog>()
            .Property(e => e.Action)
            .HasConversion<string>();

        modelBuilder.Entity<Report>()
            .Property(e => e.ReportType)
            .HasConversion<string>();

        modelBuilder.Entity<Report>()
            .Property(e => e.FileFormat)
            .HasConversion<string>();

        // Seed default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Administrator with full system access", CreatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), UpdatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) },
            new Role { Id = 2, Name = "Pharmacist", Description = "Pharmacist with inventory management permissions", CreatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), UpdatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) },
            new Role { Id = 3, Name = "Staff", Description = "Staff member with limited access", CreatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc), UpdatedAt = new DateTime(2025, 9, 23, 11, 31, 28, 145, DateTimeKind.Utc) }
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is BaseEntity && (
                e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var entity = (BaseEntity)entityEntry.Entity;

            if (entityEntry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;
            }
            else if (entityEntry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}