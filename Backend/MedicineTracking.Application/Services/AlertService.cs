using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Enums;
using MedicineTracking.Domain.Interfaces;

namespace MedicineTracking.Application.Services;

public class AlertService : IAlertService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AlertService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AlertDto>> GetAllAlertsAsync()
    {
        var alerts = await _unitOfWork.Alerts.GetAllAsync();
        return _mapper.Map<IEnumerable<AlertDto>>(alerts.OrderByDescending(a => a.CreatedAt));
    }

    public async Task<IEnumerable<AlertDto>> GetActiveAlertsAsync()
    {
        var alerts = await _unitOfWork.Alerts.FindAsync(a => a.IsActive);
        return _mapper.Map<IEnumerable<AlertDto>>(alerts.OrderByDescending(a => a.CreatedAt));
    }

    public async Task<IEnumerable<AlertDto>> GetUnreadAlertsAsync()
    {
        var alerts = await _unitOfWork.Alerts.FindAsync(a => a.IsActive && !a.IsRead);
        return _mapper.Map<IEnumerable<AlertDto>>(alerts.OrderByDescending(a => a.CreatedAt));
    }

    public async Task<IEnumerable<AlertDto>> GetAlertsByTypeAsync(AlertType type)
    {
        var alerts = await _unitOfWork.Alerts.FindAsync(a => a.IsActive && a.AlertType == type);
        return _mapper.Map<IEnumerable<AlertDto>>(alerts.OrderByDescending(a => a.CreatedAt));
    }

    public async Task<AlertDto?> GetAlertByIdAsync(int id)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(id);
        return alert != null ? _mapper.Map<AlertDto>(alert) : null;
    }

    public async Task<AlertDto> CreateAlertAsync(CreateAlertDto createDto)
    {
        var alert = _mapper.Map<Alert>(createDto);
        await _unitOfWork.Alerts.AddAsync(alert);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AlertDto>(alert);
    }

    public async Task<bool> MarkAlertAsReadAsync(int alertId, string userId)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null) return false;

        alert.IsRead = true;
        alert.ReadAt = DateTime.UtcNow;
        alert.ReadBy = userId;

        await _unitOfWork.Alerts.UpdateAsync(alert);
        return await _unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<bool> MarkAlertAsUnreadAsync(int alertId)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null) return false;

        alert.IsRead = false;
        alert.ReadAt = null;
        alert.ReadBy = null;

        await _unitOfWork.Alerts.UpdateAsync(alert);
        return await _unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeactivateAlertAsync(int alertId, string userId)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null) return false;

        alert.IsActive = false;
        if (!alert.IsRead)
        {
            alert.IsRead = true;
            alert.ReadAt = DateTime.UtcNow;
            alert.ReadBy = userId;
        }

        await _unitOfWork.Alerts.UpdateAsync(alert);
        return await _unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<AlertSummaryDto> GetAlertSummaryAsync()
    {
        var alerts = await _unitOfWork.Alerts.FindAsync(a => a.IsActive);

        return new AlertSummaryDto
        {
            TotalAlerts = alerts.Count(),
            UnreadAlerts = alerts.Count(a => !a.IsRead),
            HighSeverityAlerts = alerts.Count(a => a.Severity == "High"),
            MediumSeverityAlerts = alerts.Count(a => a.Severity == "Medium"),
            LowSeverityAlerts = alerts.Count(a => a.Severity == "Low"),
            LowStockAlerts = alerts.Count(a => a.AlertType == AlertType.LOW_STOCK),
            ExpiryAlerts = alerts.Count(a => a.AlertType == AlertType.EXPIRY_WARNING),
            ExpiredAlerts = alerts.Count(a => a.AlertType == AlertType.EXPIRED)
        };
    }

    public async Task CheckAndCreateLowStockAlertsAsync()
    {
        var medicines = await _unitOfWork.Medicines.FindAsync(m => m.IsActive);
        var lowStockMedicines = medicines.Where(m => m.IsLowStock);

        foreach (var medicine in lowStockMedicines)
        {
            // Check if alert already exists
            var existingAlert = await _unitOfWork.Alerts.FirstOrDefaultAsync(a =>
                a.MedicineId == medicine.Id &&
                a.AlertType == AlertType.LOW_STOCK &&
                a.IsActive);

            if (existingAlert == null)
            {
                var alert = new Alert
                {
                    AlertType = AlertType.LOW_STOCK,
                    MedicineId = medicine.Id,
                    Message = $"{medicine.Name} stock is running low. Current: {medicine.TotalCurrentStock}, Minimum: {medicine.MinimumStockLevel}",
                    CurrentStock = medicine.TotalCurrentStock,
                    MinimumStock = medicine.MinimumStockLevel
                };

                await _unitOfWork.Alerts.AddAsync(alert);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task CheckAndCreateExpiryAlertsAsync(int daysAhead = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        var batches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.IsActive &&
            b.CurrentQuantity > 0 &&
            b.ExpiryDate <= cutoffDate &&
            b.ExpiryDate > DateTime.UtcNow.Date);

        foreach (var batch in batches)
        {
            // Check if alert already exists
            var existingAlert = await _unitOfWork.Alerts.FirstOrDefaultAsync(a =>
                a.MedicineBatchId == batch.Id &&
                a.AlertType == AlertType.EXPIRY_WARNING &&
                a.IsActive);

            if (existingAlert == null)
            {
                var daysToExpiry = (batch.ExpiryDate.Date - DateTime.UtcNow.Date).Days;
                var alert = new Alert
                {
                    AlertType = AlertType.EXPIRY_WARNING,
                    MedicineId = batch.MedicineId,
                    MedicineBatchId = batch.Id,
                    Message = $"{batch.Medicine?.Name} batch {batch.BatchNumber} expires in {daysToExpiry} days",
                    ExpiryDate = batch.ExpiryDate,
                    CurrentStock = batch.CurrentQuantity
                };

                await _unitOfWork.Alerts.AddAsync(alert);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task CheckAndCreateExpiredAlertsAsync()
    {
        var currentDate = DateTime.UtcNow.Date;
        var expiredBatches = await _unitOfWork.MedicineBatches.FindAsync(b =>
            b.IsActive &&
            b.CurrentQuantity > 0 &&
            b.ExpiryDate < currentDate);

        foreach (var batch in expiredBatches)
        {
            // Check if alert already exists
            var existingAlert = await _unitOfWork.Alerts.FirstOrDefaultAsync(a =>
                a.MedicineBatchId == batch.Id &&
                a.AlertType == AlertType.EXPIRED &&
                a.IsActive);

            if (existingAlert == null)
            {
                var alert = new Alert
                {
                    AlertType = AlertType.EXPIRED,
                    MedicineId = batch.MedicineId,
                    MedicineBatchId = batch.Id,
                    Message = $"{batch.Medicine?.Name} batch {batch.BatchNumber} has expired",
                    ExpiryDate = batch.ExpiryDate,
                    CurrentStock = batch.CurrentQuantity
                };

                await _unitOfWork.Alerts.AddAsync(alert);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> DeleteAlertAsync(int alertId)
    {
        var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId);
        if (alert == null) return false;

        await _unitOfWork.Alerts.DeleteAsync(alert);
        return await _unitOfWork.SaveChangesAsync() > 0;
    }
}