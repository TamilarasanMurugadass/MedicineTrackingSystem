using MedicineTracking.Api.Models;
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
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetAllAlerts()
    {
        try
        {
            var alerts = await _alertService.GetAllAlertsAsync();
            return Ok(ApiResponse<IEnumerable<AlertDto>>.SuccessResponse(alerts, "Alerts retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all alerts");
            return StatusCode(500, ApiResponse<IEnumerable<AlertDto>>.ErrorResponse("An error occurred while retrieving alerts", 500));
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetActiveAlerts()
    {
        try
        {
            var alerts = await _alertService.GetActiveAlertsAsync();
            return Ok(ApiResponse<IEnumerable<AlertDto>>.SuccessResponse(alerts, "Active alerts retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active alerts");
            return StatusCode(500, ApiResponse<IEnumerable<AlertDto>>.ErrorResponse("An error occurred while retrieving active alerts", 500));
        }
    }

    [HttpGet("unread")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetUnreadAlerts()
    {
        try
        {
            var alerts = await _alertService.GetUnreadAlertsAsync();
            return Ok(ApiResponse<IEnumerable<AlertDto>>.SuccessResponse(alerts, "Unread alerts retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unread alerts");
            return StatusCode(500, ApiResponse<IEnumerable<AlertDto>>.ErrorResponse("An error occurred while retrieving unread alerts", 500));
        }
    }

    [HttpGet("type/{type}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetAlertsByType(AlertType type)
    {
        try
        {
            var alerts = await _alertService.GetAlertsByTypeAsync(type);
            return Ok(ApiResponse<IEnumerable<AlertDto>>.SuccessResponse(alerts, "Alerts retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts by type {AlertType}", type);
            return StatusCode(500, ApiResponse<IEnumerable<AlertDto>>.ErrorResponse("An error occurred while retrieving alerts by type", 500));
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<AlertSummaryDto>>> GetAlertSummary()
    {
        try
        {
            var summary = await _alertService.GetAlertSummaryAsync();
            return Ok(ApiResponse<AlertSummaryDto>.SuccessResponse(summary, "Alert summary retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert summary");
            return StatusCode(500, ApiResponse<AlertSummaryDto>.ErrorResponse("An error occurred while retrieving alert summary", 500));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AlertDto>>> GetAlertById(int id)
    {
        try
        {
            var alert = await _alertService.GetAlertByIdAsync(id);
            if (alert == null)
            {
                return NotFound(ApiResponse<AlertDto>.NotFoundResponse("Alert not found"));
            }

            return Ok(ApiResponse<AlertDto>.SuccessResponse(alert, "Alert retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alert {AlertId}", id);
            return StatusCode(500, ApiResponse<AlertDto>.ErrorResponse("An error occurred while retrieving the alert", 500));
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<AlertDto>>> CreateAlert([FromBody] CreateAlertDto createAlertDto)
    {
        try
        {
            var alert = await _alertService.CreateAlertAsync(createAlertDto);
            _logger.LogInformation("Alert created: {AlertType} for medicine {MedicineId}", alert.AlertType, alert.MedicineId);

            return CreatedAtAction(nameof(GetAlertById), new { id = alert.Id }, ApiResponse<AlertDto>.CreatedResponse(alert, "Alert created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alert for medicine {MedicineId}", createAlertDto.MedicineId);
            return StatusCode(500, ApiResponse<AlertDto>.ErrorResponse("An error occurred while creating the alert", 500));
        }
    }

    [HttpPost("{id}/mark-read")]
    public async Task<ActionResult<ApiResponse>> MarkAlertAsRead(int id)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("User ID not found in token", 401));
            }

            var success = await _alertService.MarkAlertAsReadAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(ApiResponse.ErrorResponse("Alert not found", 404));
            }

            _logger.LogInformation("Alert {AlertId} marked as read by user {UserId}", id, currentUserId);
            return Ok(ApiResponse.SuccessResponse("Alert marked as read successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking alert {AlertId} as read", id);
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while marking alert as read", 500));
        }
    }

    [HttpPost("{id}/mark-unread")]
    public async Task<ActionResult<ApiResponse>> MarkAlertAsUnread(int id)
    {
        try
        {
            var success = await _alertService.MarkAlertAsUnreadAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse.ErrorResponse("Alert not found", 404));
            }

            _logger.LogInformation("Alert {AlertId} marked as unread", id);
            return Ok(ApiResponse.SuccessResponse("Alert marked as unread successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking alert {AlertId} as unread", id);
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while marking alert as unread", 500));
        }
    }

    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse>> DeactivateAlert(int id)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("User ID not found in token", 401));
            }

            var success = await _alertService.DeactivateAlertAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(ApiResponse.ErrorResponse("Alert not found", 404));
            }

            _logger.LogInformation("Alert {AlertId} deactivated by user {UserId}", id, currentUserId);
            return Ok(ApiResponse.SuccessResponse("Alert deactivated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating alert {AlertId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while deactivating alert", 500));
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteAlert(int id)
    {
        try
        {
            var success = await _alertService.DeleteAlertAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse.ErrorResponse("Alert not found", 404));
            }

            _logger.LogInformation("Alert {AlertId} deleted", id);
            return Ok(ApiResponse.SuccessResponse("Alert deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting alert {AlertId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while deleting alert", 500));
        }
    }

    [HttpPost("check-low-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse>> CheckLowStockAlerts()
    {
        try
        {
            await _alertService.CheckAndCreateLowStockAlertsAsync();
            _logger.LogInformation("Low stock alerts check completed");
            return Ok(ApiResponse.SuccessResponse("Low stock alerts checked and created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking low stock alerts");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while checking low stock alerts", 500));
        }
    }

    [HttpPost("check-expiry")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse>> CheckExpiryAlerts([FromQuery] int daysAhead = 90)
    {
        try
        {
            await _alertService.CheckAndCreateExpiryAlertsAsync(daysAhead);
            _logger.LogInformation("Expiry alerts check completed for {DaysAhead} days ahead", daysAhead);
            return Ok(ApiResponse.SuccessResponse("Expiry alerts checked and created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking expiry alerts");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while checking expiry alerts", 500));
        }
    }

    [HttpPost("check-expired")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse>> CheckExpiredAlerts()
    {
        try
        {
            await _alertService.CheckAndCreateExpiredAlertsAsync();
            _logger.LogInformation("Expired alerts check completed");
            return Ok(ApiResponse.SuccessResponse("Expired alerts checked and created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking expired alerts");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred while checking expired alerts", 500));
        }
    }
}