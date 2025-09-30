using MedicineTracking.Application.DTOs;
using MedicineTracking.Domain.Enums;

namespace MedicineTracking.Application.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryTransactionDto>> GetAllTransactionsAsync();
    Task<InventoryTransactionDto?> GetTransactionByIdAsync(int id);
    Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByBatchAsync(int batchId);
    Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByUserAsync(string userId);
    Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByTypeAsync(TransactionType type);
    Task<IEnumerable<InventoryTransactionDto>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<InventoryTransactionDto> RecordTransactionAsync(CreateInventoryTransactionDto createDto, string userId);
    Task<bool> WithdrawMedicineAsync(int batchId, int quantity, string reason, string? patientReference, string? notes, string userId);
    Task<bool> AdjustStockAsync(int batchId, int adjustment, string reason, string? notes, string userId);
    Task<bool> MarkAsExpiredAsync(int batchId, string? notes, string userId);
    Task<bool> MarkAsDamagedAsync(int batchId, int quantity, string reason, string? notes, string userId);
    Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryByUserAsync(string userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<UsageSummaryDto>> GetUsageSummaryByMedicineAsync(int medicineId, DateTime? startDate = null, DateTime? endDate = null);
}