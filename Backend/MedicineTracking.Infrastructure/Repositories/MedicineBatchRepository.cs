using MedicineTracking.Domain.Entities;
using MedicineTracking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedicineTracking.Infrastructure.Repositories;

public class MedicineBatchRepository : Repository<MedicineBatch>
{
    public MedicineBatchRepository(MedicineTrackingDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<MedicineBatch>> GetBatchesNearingExpiryAsync(int daysAhead = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        return await _dbSet
            .Where(b => b.IsActive &&
                       b.CurrentQuantity > 0 &&
                       b.ExpiryDate <= cutoffDate)
            .Include(b => b.Medicine)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MedicineBatch>> GetExpiredBatchesAsync()
    {
        var currentDate = DateTime.UtcNow.Date;
        return await _dbSet
            .Where(b => b.IsActive &&
                       b.CurrentQuantity > 0 &&
                       b.ExpiryDate < currentDate)
            .Include(b => b.Medicine)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MedicineBatch>> GetBatchesByMedicineAsync(int medicineId)
    {
        return await _dbSet
            .Where(b => b.MedicineId == medicineId && b.IsActive)
            .Include(b => b.InventoryTransactions.OrderByDescending(t => t.CreatedAt))
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();
    }

    public async Task<MedicineBatch?> GetBatchWithTransactionsAsync(int batchId)
    {
        return await _dbSet
            .Include(b => b.Medicine)
            .Include(b => b.InventoryTransactions.OrderByDescending(t => t.CreatedAt))
                .ThenInclude(t => t.Creator)
            .Include(b => b.Creator)
            .FirstOrDefaultAsync(b => b.Id == batchId);
    }

    public async Task<bool> IsBatchNumberUniqueAsync(int medicineId, string batchNumber, int? excludeBatchId = null)
    {
        var query = _dbSet.Where(b => b.MedicineId == medicineId && b.BatchNumber == batchNumber);

        if (excludeBatchId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBatchId);
        }

        return !await query.AnyAsync();
    }

    public async Task<IEnumerable<MedicineBatch>> GetDepletedBatchesAsync()
    {
        return await _dbSet
            .Where(b => b.IsActive && b.CurrentQuantity <= 0)
            .Include(b => b.Medicine)
            .OrderBy(b => b.Medicine.Name)
            .ThenBy(b => b.BatchNumber)
            .ToListAsync();
    }

    public async Task<Dictionary<string, object>> GetBatchStatisticsAsync()
    {
        var totalBatches = await _dbSet.CountAsync(b => b.IsActive);
        var activeBatches = await _dbSet.CountAsync(b => b.IsActive && b.CurrentQuantity > 0);
        var expiredBatches = await _dbSet.CountAsync(b => b.IsActive && b.ExpiryDate < DateTime.UtcNow.Date);
        var nearingExpiry = await _dbSet.CountAsync(b => b.IsActive &&
                                                         b.CurrentQuantity > 0 &&
                                                         b.ExpiryDate <= DateTime.UtcNow.AddDays(30));

        return new Dictionary<string, object>
        {
            ["TotalBatches"] = totalBatches,
            ["ActiveBatches"] = activeBatches,
            ["ExpiredBatches"] = expiredBatches,
            ["NearingExpiry"] = nearingExpiry,
            ["DepletedBatches"] = totalBatches - activeBatches
        };
    }
}