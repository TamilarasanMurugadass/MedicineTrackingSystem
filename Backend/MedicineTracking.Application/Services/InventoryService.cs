using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Enums;
using MedicineTracking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineTracking.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public InventoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetAllTransactionsAsync()
    {
        var transactions = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryTransactionDto>>(transactions);
    }

    public async Task<InventoryTransactionDto?> GetTransactionByIdAsync(int id)
    {
        var transaction = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .FirstOrDefaultAsync(t => t.Id == id);

        return transaction != null ? _mapper.Map<InventoryTransactionDto>(transaction) : null;
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByBatchAsync(int batchId)
    {
        var transactions = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.MedicineBatchId == batchId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryTransactionDto>>(transactions);
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByUserAsync(string userId)
    {
        var transactions = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.CreatedBy == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryTransactionDto>>(transactions);
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByTypeAsync(TransactionType type)
    {
        var transactions = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.TransactionType == type)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryTransactionDto>>(transactions);
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var transactions = await _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryTransactionDto>>(transactions);
    }

    public async Task<InventoryTransactionDto> RecordTransactionAsync(CreateInventoryTransactionDto createDto, string userId)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(createDto.MedicineBatchId);
        if (batch == null)
            throw new ArgumentException($"Medicine batch not found with ID: {createDto.MedicineBatchId}");

        var transaction = _mapper.Map<InventoryTransaction>(createDto);
        transaction.CreatedBy = userId;

        // Calculate remaining quantity based on transaction type
        switch (createDto.TransactionType)
        {
            case TransactionType.IN:
                batch.CurrentQuantity += createDto.Quantity;
                break;
            case TransactionType.OUT:
                if (batch.CurrentQuantity < createDto.Quantity)
                    throw new InvalidOperationException($"Insufficient stock. Available: {batch.CurrentQuantity}, Requested: {createDto.Quantity}");
                batch.CurrentQuantity -= createDto.Quantity;
                break;
            case TransactionType.ADJUSTMENT:
                var newQuantity = batch.CurrentQuantity + createDto.Quantity;
                if (newQuantity < 0)
                    throw new InvalidOperationException("Adjustment would result in negative stock");
                batch.CurrentQuantity = newQuantity;
                break;
            case TransactionType.EXPIRED:
            case TransactionType.DAMAGED:
                if (batch.CurrentQuantity < createDto.Quantity)
                    throw new InvalidOperationException("Cannot remove more than available stock");
                batch.CurrentQuantity -= createDto.Quantity;
                break;
        }

        transaction.RemainingQuantity = batch.CurrentQuantity;

        // Use ExecuteInTransactionAsync which is compatible with retry strategy
        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _unitOfWork.InventoryTransactions.AddAsync(transaction);
            await _unitOfWork.MedicineBatches.UpdateAsync(batch);
            await _unitOfWork.SaveChangesAsync();
        });

        return _mapper.Map<InventoryTransactionDto>(transaction);
    }

    public async Task<bool> WithdrawMedicineAsync(int batchId, int quantity, string reason, string? patientReference, string? notes, string userId)
    {
        var createDto = new CreateInventoryTransactionDto
        {
            MedicineBatchId = batchId,
            TransactionType = TransactionType.OUT,
            Quantity = quantity,
            Reason = reason,
            PatientReference = patientReference,
            Notes = notes
        };

        try
        {
            await RecordTransactionAsync(createDto, userId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> AdjustStockAsync(int batchId, int adjustment, string reason, string? notes, string userId)
    {
        var createDto = new CreateInventoryTransactionDto
        {
            MedicineBatchId = batchId,
            TransactionType = TransactionType.ADJUSTMENT,
            Quantity = adjustment,
            Reason = reason,
            Notes = notes
        };

        try
        {
            await RecordTransactionAsync(createDto, userId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> MarkAsExpiredAsync(int batchId, string? notes, string userId)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(batchId);
        if (batch == null) return false;

        var createDto = new CreateInventoryTransactionDto
        {
            MedicineBatchId = batchId,
            TransactionType = TransactionType.EXPIRED,
            Quantity = batch.CurrentQuantity,
            Reason = "Marked as expired",
            Notes = notes
        };

        try
        {
            await RecordTransactionAsync(createDto, userId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> MarkAsDamagedAsync(int batchId, int quantity, string reason, string? notes, string userId)
    {
        var createDto = new CreateInventoryTransactionDto
        {
            MedicineBatchId = batchId,
            TransactionType = TransactionType.DAMAGED,
            Quantity = quantity,
            Reason = reason,
            Notes = notes
        };

        try
        {
            await RecordTransactionAsync(createDto, userId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.TransactionType == TransactionType.OUT);

        if (startDate.HasValue)
            query = query.Where(t => t.CreatedAt >= startDate);
        if (endDate.HasValue)
            query = query.Where(t => t.CreatedAt <= endDate);

        var transactions = await query.ToListAsync();

        var summary = transactions
            .GroupBy(t => new { t.MedicineBatch.Medicine.Name, t.Creator.FullName })
            .Select(g => new UsageSummaryDto
            {
                MedicineName = g.Key.Name,
                UserName = g.Key.FullName,
                TotalQuantityUsed = g.Sum(t => t.Quantity),
                TransactionCount = g.Count(),
                FirstUsage = g.Min(t => t.CreatedAt),
                LastUsage = g.Max(t => t.CreatedAt)
            });

        return summary.OrderByDescending(s => s.TotalQuantityUsed);
    }

    public async Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryByUserAsync(string userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.TransactionType == TransactionType.OUT && t.CreatedBy == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.CreatedAt >= startDate);
        if (endDate.HasValue)
            query = query.Where(t => t.CreatedAt <= endDate);

        var transactions = await query.ToListAsync();

        var summary = transactions
            .GroupBy(t => t.MedicineBatch.Medicine.Name)
            .Select(g => new UsageSummaryDto
            {
                MedicineName = g.Key,
                UserName = g.First().Creator.FullName,
                TotalQuantityUsed = g.Sum(t => t.Quantity),
                TransactionCount = g.Count(),
                FirstUsage = g.Min(t => t.CreatedAt),
                LastUsage = g.Max(t => t.CreatedAt)
            });

        return summary.OrderByDescending(s => s.TotalQuantityUsed);
    }

    public async Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryByMedicineAsync(int medicineId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _unitOfWork.GetDbSet<InventoryTransaction>()
            .Include(t => t.MedicineBatch)
                .ThenInclude(b => b.Medicine)
            .Include(t => t.Creator)
            .Where(t => t.TransactionType == TransactionType.OUT && t.MedicineBatch.MedicineId == medicineId);

        if (startDate.HasValue)
            query = query.Where(t => t.CreatedAt >= startDate);
        if (endDate.HasValue)
            query = query.Where(t => t.CreatedAt <= endDate);

        var transactions = await query.ToListAsync();

        var summary = transactions
            .GroupBy(t => t.Creator.FullName)
            .Select(g => new UsageSummaryDto
            {
                MedicineName = g.First().MedicineBatch.Medicine.Name,
                UserName = g.Key,
                TotalQuantityUsed = g.Sum(t => t.Quantity),
                TransactionCount = g.Count(),
                FirstUsage = g.Min(t => t.CreatedAt),
                LastUsage = g.Max(t => t.CreatedAt)
            });

        return summary.OrderByDescending(s => s.TotalQuantityUsed);
    }
}