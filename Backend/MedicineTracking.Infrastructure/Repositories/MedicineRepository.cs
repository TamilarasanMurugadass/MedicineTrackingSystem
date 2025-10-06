using MedicineTracking.Domain.Entities;
using MedicineTracking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedicineTracking.Infrastructure.Repositories;

public class MedicineRepository : Repository<Medicine>
{
    public MedicineRepository(MedicineTrackingDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Medicine>> GetAllAsync()
    {
        return await _dbSet
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public override async Task<Medicine?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public override async Task<IEnumerable<Medicine>> FindAsync(System.Linq.Expressions.Expression<Func<Medicine, bool>> predicate)
    {
        return await _dbSet
            .Where(predicate)
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Medicine>> GetActiveMedicinesAsync()
    {
        return await _dbSet
            .Where(m => m.IsActive)
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Medicine>> GetLowStockMedicinesAsync()
    {
        return await _dbSet
            .Where(m => m.IsActive)
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .Where(m => m.MedicineBatches.Sum(b => b.CurrentQuantity) <= m.MinimumStockLevel)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<Medicine?> GetMedicineWithBatchesAsync(int medicineId)
    {
        return await _dbSet
            .Include(m => m.MedicineBatches.Where(b => b.IsActive))
                .ThenInclude(b => b.InventoryTransactions.OrderByDescending(t => t.CreatedAt))
            .Include(m => m.Creator)
            .FirstOrDefaultAsync(m => m.Id == medicineId);
    }

    public async Task<IEnumerable<Medicine>> SearchMedicinesAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet
            .Where(m => m.IsActive &&
                       (m.Name.ToLower().Contains(term) ||
                        (m.GenericName != null && m.GenericName.ToLower().Contains(term)) ||
                        m.Manufacturer.ToLower().Contains(term)))
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .Include(m => m.Creator)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<Dictionary<string, int>> GetMedicineStockSummaryAsync()
    {
        return await _dbSet
            .Where(m => m.IsActive)
            .Include(m => m.MedicineBatches.Where(b => b.IsActive && b.CurrentQuantity > 0))
            .ToDictionaryAsync(
                m => m.Name,
                m => m.MedicineBatches.Sum(b => b.CurrentQuantity)
            );
    }
}