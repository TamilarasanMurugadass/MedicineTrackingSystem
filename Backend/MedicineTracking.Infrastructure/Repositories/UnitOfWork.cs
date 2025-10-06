using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Interfaces;
using MedicineTracking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace MedicineTracking.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly MedicineTrackingDbContext _context;
    private IDbContextTransaction? _transaction;

    private IRepository<Medicine>? _medicines;
    private IRepository<MedicineBatch>? _medicineBatches;
    private IRepository<InventoryTransaction>? _inventoryTransactions;
    private IRepository<Alert>? _alerts;
    private IRepository<AuditLog>? _auditLogs;
    private IRepository<Report>? _reports;
    private IRepository<Role>? _roles;
    private IRepository<User>? _users;

    public UnitOfWork(MedicineTrackingDbContext context)
    {
        _context = context;
    }

    public IRepository<Medicine> Medicines =>
        _medicines ??= new MedicineRepository(_context);

    public IRepository<MedicineBatch> MedicineBatches =>
        _medicineBatches ??= new MedicineBatchRepository(_context);

    public IRepository<InventoryTransaction> InventoryTransactions =>
        _inventoryTransactions ??= new Repository<InventoryTransaction>(_context);

    public IRepository<Alert> Alerts =>
        _alerts ??= new Repository<Alert>(_context);

    public IRepository<AuditLog> AuditLogs =>
        _auditLogs ??= new Repository<AuditLog>(_context);

    public IRepository<Report> Reports =>
        _reports ??= new Repository<Report>(_context);

    public IRepository<Role> Roles =>
        _roles ??= new Repository<Role>(_context);

    public IRepository<User> Users =>
        _users ??= new Repository<User>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task ExecuteInTransactionAsync(Func<Task> operation)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await operation();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public DbSet<T> GetDbSet<T>() where T : class
    {
        return _context.Set<T>();
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}