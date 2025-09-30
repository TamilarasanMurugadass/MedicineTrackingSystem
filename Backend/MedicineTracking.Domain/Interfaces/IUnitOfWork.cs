using MedicineTracking.Domain.Entities;

namespace MedicineTracking.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Medicine> Medicines { get; }
    IRepository<MedicineBatch> MedicineBatches { get; }
    IRepository<InventoryTransaction> InventoryTransactions { get; }
    IRepository<Alert> Alerts { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<Report> Reports { get; }
    IRepository<Role> Roles { get; }
    IRepository<User> Users { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}