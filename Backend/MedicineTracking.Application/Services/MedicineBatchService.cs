using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Interfaces;

namespace MedicineTracking.Application.Services;

public class MedicineBatchService : IMedicineBatchService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MedicineBatchService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MedicineBatchDto>> GetAllBatchesAsync()
    {
        var batches = await _unitOfWork.MedicineBatches.GetAllAsync();
        return _mapper.Map<IEnumerable<MedicineBatchDto>>(batches.OrderBy(b => b.ExpiryDate));
    }

    public async Task<MedicineBatchDto?> GetBatchByIdAsync(int id)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(id);
        return batch != null ? _mapper.Map<MedicineBatchDto>(batch) : null;
    }

    public async Task<MedicineBatchDto?> GetBatchWithTransactionsAsync(int id)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(id);
        return batch != null ? _mapper.Map<MedicineBatchDto>(batch) : null;
    }

    public async Task<IEnumerable<MedicineBatchDto>> GetBatchesByMedicineAsync(int medicineId)
    {
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b => b.MedicineId == medicineId && b.IsActive);
        return _mapper.Map<IEnumerable<MedicineBatchDto>>(batches.OrderBy(b => b.ExpiryDate));
    }

    public async Task<IEnumerable<MedicineBatchDto>> GetBatchesNearingExpiryAsync(int daysAhead = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.IsActive &&
            b.CurrentQuantity > 0 &&
            b.ExpiryDate <= cutoffDate &&
            b.ExpiryDate > DateTime.UtcNow.Date);

        return _mapper.Map<IEnumerable<MedicineBatchDto>>(batches.OrderBy(b => b.ExpiryDate));
    }

    public async Task<IEnumerable<MedicineBatchDto>> GetExpiredBatchesAsync()
    {
        var currentDate = DateTime.UtcNow.Date;
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.IsActive &&
            b.CurrentQuantity > 0 &&
            b.ExpiryDate < currentDate);

        return _mapper.Map<IEnumerable<MedicineBatchDto>>(batches.OrderBy(b => b.ExpiryDate));
    }

    public async Task<IEnumerable<MedicineBatchDto>> GetDepletedBatchesAsync()
    {
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b => b.IsActive && b.CurrentQuantity <= 0);
        return _mapper.Map<IEnumerable<MedicineBatchDto>>(batches.OrderBy(b => b.Medicine.Name).ThenBy(b => b.BatchNumber));
    }

    public async Task<MedicineBatchDto> CreateBatchAsync(CreateMedicineBatchDto createDto, string userId)
    {
        // Validate medicine exists
        var medicine = await _unitOfWork.Medicines.GetByIdAsync(createDto.MedicineId);
        if (medicine == null)
            throw new ArgumentException("Medicine not found");

        // Check batch number uniqueness
        var isUnique = await IsBatchNumberUniqueAsync(createDto.MedicineId, createDto.BatchNumber);
        if (!isUnique)
            throw new InvalidOperationException("Batch number already exists for this medicine");

        var batch = _mapper.Map<MedicineBatch>(createDto);
        batch.CreatedBy = userId;

        await _unitOfWork.MedicineBatches.AddAsync(batch);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MedicineBatchDto>(batch);
    }

    public async Task<MedicineBatchDto?> UpdateBatchAsync(int id, UpdateMedicineBatchDto updateDto, string userId)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(id);
        if (batch == null) return null;

        // Check batch number uniqueness if changed
        if (batch.BatchNumber != updateDto.BatchNumber)
        {
            var isUnique = await IsBatchNumberUniqueAsync(batch.MedicineId, updateDto.BatchNumber, id);
            if (!isUnique)
                throw new InvalidOperationException("Batch number already exists for this medicine");
        }

        _mapper.Map(updateDto, batch);
        batch.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.MedicineBatches.UpdateAsync(batch);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MedicineBatchDto>(batch);
    }

    public async Task<bool> DeleteBatchAsync(int id, string userId)
    {
        var batch = await _unitOfWork.MedicineBatches.GetByIdAsync(id);
        if (batch == null) return false;

        // Check if batch has transactions
        var hasTransactions = await _unitOfWork.InventoryTransactions.ExistsAsync(t => t.MedicineBatchId == id);

        if (hasTransactions || batch.CurrentQuantity < batch.InitialQuantity)
        {
            // Soft delete - mark as inactive
            batch.IsActive = false;
            batch.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.MedicineBatches.UpdateAsync(batch);
        }
        else
        {
            // Hard delete if no transactions
            await _unitOfWork.MedicineBatches.DeleteAsync(batch);
        }

        return await _unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<bool> IsBatchNumberUniqueAsync(int medicineId, string batchNumber, int? excludeBatchId = null)
    {
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.MedicineId == medicineId && b.BatchNumber.ToLower() == batchNumber.ToLower());

        if (excludeBatchId.HasValue)
        {
            batches = batches.Where(b => b.Id != excludeBatchId.Value);
        }

        return !batches.Any();
    }

    public async Task<Dictionary<string, object>> GetBatchStatisticsAsync()
    {
        var batches = await _unitOfWork.MedicineBatches.GetAllAsync();
        var activeBatches = batches.Where(b => b.IsActive);
        var currentDate = DateTime.UtcNow.Date;

        return new Dictionary<string, object>
        {
            ["TotalBatches"] = batches.Count(),
            ["ActiveBatches"] = activeBatches.Count(b => b.CurrentQuantity > 0),
            ["ExpiredBatches"] = activeBatches.Count(b => b.ExpiryDate < currentDate),
            ["NearingExpiry"] = activeBatches.Count(b => b.CurrentQuantity > 0 && b.ExpiryDate <= DateTime.UtcNow.AddDays(30)),
            ["DepletedBatches"] = activeBatches.Count(b => b.CurrentQuantity <= 0),
            ["TotalValue"] = activeBatches.Where(b => b.PurchasePrice.HasValue).Sum(b => b.CurrentQuantity * b.PurchasePrice.Value)
        };
    }
}