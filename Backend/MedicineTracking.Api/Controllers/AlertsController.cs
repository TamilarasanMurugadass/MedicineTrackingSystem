using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(IAlertService alertService, ILogger<AlertsController> logger)
    {
        _alertService = alertService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetAllAlerts()
    {
        try
        {
            var alerts = await _alertService.GetAllAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all alerts");
            return StatusCode(500, new { message = "An error occurred while retrieving alerts" });
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetActiveAlerts()
    {
        try
        {
            var alerts = await _alertService.GetActiveAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active alerts");
            return StatusCode(500, new { message = "An error occurred while retrieving active alerts" });
        }
    }

    [HttpGet("unread")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetUnreadAlerts()
    {
        try
        {
            var alerts = await _alertService.GetUnreadAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unread alerts");
            return StatusCode(500, new { message = "An error occurred while retrieving unread alerts" });
        }
    }

    [HttpGet("type/{type}")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlertsByType(AlertType type)
    {
        try
        {
            var alerts = await _alertService.GetAlertsByTypeAsync(type);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by type {AlertType}", type);
            return StatusCode(500, new { message = "An error occurred while retrieving alerts by type" });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<AlertSummaryDto>> GetAlertSummary()
    {
        try
        {
            var summary = await _alertService.GetAlertSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert summary");
            return StatusCode(500, new { message = "An error occurred while retrieving alert summary" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AlertDto>> GetAlertById(int id)
    {
        try
        {
            var alert = await _alertService.GetAlertByIdAsync(id);
            if (alert == null)
            {
                return NotFound(new { message = "Alert not found" });
            }

            return Ok(alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert {AlertId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the alert" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<AlertDto>> CreateAlert([FromBody] CreateAlertDto createAlertDto)
    {
        try
        {
            var alert = await _alertService.CreateAlertAsync(createAlertDto);
            _logger.LogInformation("Alert created: {AlertType} for medicine {MedicineId}", alert.AlertType, alert.MedicineId);

            return CreatedAtAction(nameof(GetAlertById), new { id = alert.Id }, alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alert for medicine {MedicineId}", createAlertDto.MedicineId);
            return StatusCode(500, new { message = "An error occurred while creating the alert" });
        }
    }

    [HttpPost("{id}/mark-read")]
    public async Task<ActionResult> MarkAlertAsRead(int id)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var success = await _alertService.MarkAlertAsReadAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(new { message = "Alert not found" });
            }

            _logger.LogInformation("Alert {AlertId} marked as read by user {UserId}", id, currentUserId);
            return Ok(new { message = "Alert marked as read successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking alert {AlertId} as read", id);
            return StatusCode(500, new { message = "An error occurred while marking alert as read" });
        }
    }

    [HttpPost("{id}/mark-unread")]
    public async Task<ActionResult> MarkAlertAsUnread(int id)
    {
        try
        {
            var success = await _alertService.MarkAlertAsUnreadAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Alert not found" });
            }

            _logger.LogInformation("Alert {AlertId} marked as unread", id);
            return Ok(new { message = "Alert marked as unread successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking alert {AlertId} as unread", id);
            return StatusCode(500, new { message = "An error occurred while marking alert as unread" });
        }
    }

    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> DeactivateAlert(int id)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var success = await _alertService.DeactivateAlertAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(new { message = "Alert not found" });
            }

            _logger.LogInformation("Alert {AlertId} deactivated by user {UserId}", id, currentUserId);
            return Ok(new { message = "Alert deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating alert {AlertId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating alert" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteAlert(int id)
    {
        try
        {
            var success = await _alertService.DeleteAlertAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Alert not found" });
            }

            _logger.LogInformation("Alert {AlertId} deleted", id);
            return Ok(new { message = "Alert deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting alert {AlertId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting alert" });
        }
    }

    [HttpPost("check-low-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> CheckLowStockAlerts()
    {
        try
        {
            await _alertService.CheckAndCreateLowStockAlertsAsync();
            _logger.LogInformation("Low stock alerts check completed");
            return Ok(new { message = "Low stock alerts checked and created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking low stock alerts");
            return StatusCode(500, new { message = "An error occurred while checking low stock alerts" });
        }
    }

    [HttpPost("check-expiry")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> CheckExpiryAlerts([FromQuery] int daysAhead = 90)
    {
        try
        {
            await _alertService.CheckAndCreateExpiryAlertsAsync(daysAhead);
            _logger.LogInformation("Expiry alerts check completed for {DaysAhead} days ahead", daysAhead);
            return Ok(new { message = "Expiry alerts checked and created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking expiry alerts");
            return StatusCode(500, new { message = "An error occurred while checking expiry alerts" });
        }
    }

    [HttpPost("check-expired")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> CheckExpiredAlerts()
    {
        try
        {
            await _alertService.CheckAndCreateExpiredAlertsAsync();
            _logger.LogInformation("Expired alerts check completed");
            return Ok(new { message = "Expired alerts checked and created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking expired alerts");
            return StatusCode(500, new { message = "An error occurred while checking expired alerts" });
        }
    }
}