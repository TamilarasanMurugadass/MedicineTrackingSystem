using MedicineTracking.Application.DTOs;

namespace MedicineTracking.Application.Interfaces;

public interface IMedicineService
{
    Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync();
    Task<IEnumerable<MedicineDto>> GetActiveMedicinesAsync();
    Task<MedicineDto?> GetMedicineByIdAsync(int id);
    Task<MedicineDto?> GetMedicineWithBatchesAsync(int id);
    Task<IEnumerable<MedicineDto>> GetLowStockMedicinesAsync();
    Task<IEnumerable<MedicineDto>> SearchMedicinesAsync(string searchTerm);
    Task<MedicineDto> CreateMedicineAsync(CreateMedicineDto createDto, string userId);
    Task<MedicineDto?> UpdateMedicineAsync(int id, UpdateMedicineDto updateDto, string userId);
    Task<bool> DeleteMedicineAsync(int id, string userId);
    Task<bool> IsMedicineNameUniqueAsync(string name, int? excludeId = null);
    Task<Dictionary<string, int>> GetMedicineStockSummaryAsync();
}