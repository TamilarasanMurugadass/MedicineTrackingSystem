using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineTracking.Application.Services;

public class MedicineService : IMedicineService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MedicineService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync()
    {
        var medicines = await _unitOfWork.Medicines.GetAllAsync();
        return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
    }

    public async Task<IEnumerable<MedicineDto>> GetActiveMedicinesAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);
        return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
    }

    public async Task<MedicineDto?> GetMedicineByIdAsync(int id)
    {
        var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
        return medicine != null ? _mapper.Map<MedicineDto>(medicine) : null;
    }

    public async Task<MedicineDto?> GetMedicineWithBatchesAsync(int id)
    {
        var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
        return medicine != null ? _mapper.Map<MedicineDto>(medicine) : null;
    }

    public async Task<IEnumerable<MedicineDto>> GetLowStockMedicinesAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);
        var lowStockMedicines = medicines.Where(m => m.IsLowStock);
        return _mapper.Map<IEnumerable<MedicineDto>>(lowStockMedicines);
    }

    public async Task<IEnumerable<MedicineDto>> SearchMedicinesAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        var medicines = await _unitOfWork.Medicines.FindAsync(m =>
            m.IsActive &&
            (m.Name.ToLower().Contains(term) ||
             (m.GenericName != null && m.GenericName.ToLower().Contains(term)) ||
             m.Manufacturer.ToLower().Contains(term)));

        return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
    }

    public async Task<MedicineDto> CreateMedicineAsync(CreateMedicineDto createDto, string userId)
    {
        var medicine = _mapper.Map<Medicine>(createDto);
        medicine.CreatedBy = userId;

        await _unitOfWork.Medicines.AddAsync(medicine);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MedicineDto>(medicine);
    }

    public async Task<MedicineDto?> UpdateMedicineAsync(int id, UpdateMedicineDto updateDto, string userId)
    {
        var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
        if (medicine == null) return null;

        _mapper.Map(updateDto, medicine);
        medicine.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Medicines.UpdateAsync(medicine);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<MedicineDto>(medicine);
    }

    public async Task<bool> DeleteMedicineAsync(int id, string userId)
    {
        var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
        if (medicine == null) return false;

        // Check if medicine has active batches
        var hasActiveBatches = await _unitOfWork.MedicineBatches.ExistsAsync(mb =>
            mb.MedicineId == id && mb.IsActive && mb.CurrentQuantity > 0);

        if (hasActiveBatches)
        {
            // Soft delete - mark as inactive instead of hard delete
            medicine.IsActive = false;
            medicine.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Medicines.UpdateAsync(medicine);
        }
        else
        {
            // Hard delete if no active batches
            await _unitOfWork.Medicines.DeleteAsync(medicine);
        }

        return await _unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<bool> IsMedicineNameUniqueAsync(string name, int? excludeId = null)
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.Name.ToLower() == name.ToLower());

        if (excludeId.HasValue)
        {
            medicines = medicines.Where(m => m.Id != excludeId.Value);
        }

        return !medicines.Any();
    }

    public async Task<Dictionary<string, int>> GetMedicineStockSummaryAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);
        return medicines.ToDictionary(m => m.Name, m => m.TotalCurrentStock);
    }
}