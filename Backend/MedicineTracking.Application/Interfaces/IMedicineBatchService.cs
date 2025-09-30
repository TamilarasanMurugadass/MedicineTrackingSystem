using MedicineTracking.Application.DTOs;

namespace MedicineTracking.Application.Interfaces;

public interface IMedicineBatchService
{
    Task<IEnumerable<MedicineBatchDto>> GetAllBatchesAsync();
    Task<MedicineBatchDto?> GetBatchByIdAsync(int id);
    Task<MedicineBatchDto?> GetBatchWithTransactionsAsync(int id);
    Task<IEnumerable<MedicineBatchDto>> GetBatchesByMedicineAsync(int medicineId);
    Task<IEnumerable<MedicineBatchDto>> GetBatchesNearingExpiryAsync(int daysAhead = 90);
    Task<IEnumerable<MedicineBatchDto>> GetExpiredBatchesAsync();
    Task<IEnumerable<MedicineBatchDto>> GetDepletedBatchesAsync();
    Task<MedicineBatchDto> CreateBatchAsync(CreateMedicineBatchDto createDto, string userId);
    Task<MedicineBatchDto?> UpdateBatchAsync(int id, UpdateMedicineBatchDto updateDto, string userId);
    Task<bool> DeleteBatchAsync(int id, string userId);
    Task<bool> IsBatchNumberUniqueAsync(int medicineId, string batchNumber, int? excludeBatchId = null);
    Task<Dictionary<string, object>> GetBatchStatisticsAsync();
}