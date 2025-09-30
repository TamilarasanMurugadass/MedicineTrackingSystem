using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var stats = await _dashboardService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard statistics" });
        }
    }

    [HttpGet("stock-summary")]
    public async Task<ActionResult<IEnumerable<StockSummaryDto>>> GetStockSummary()
    {
        try
        {
            var summary = await _dashboardService.GetStockSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stock summary");
            return StatusCode(500, new { message = "An error occurred while retrieving stock summary" });
        }
    }

    [HttpGet("recent-activity")]
    public async Task<ActionResult<IEnumerable<RecentActivityDto>>> GetRecentActivity([FromQuery] int count = 10)
    {
        try
        {
            if (count <= 0 || count > 50)
            {
                return BadRequest(new { message = "Count must be between 1 and 50" });
            }

            var activities = await _dashboardService.GetRecentActivityAsync(count);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent activity");
            return StatusCode(500, new { message = "An error occurred while retrieving recent activity" });
        }
    }

    [HttpGet("expiry-warnings")]
    public async Task<ActionResult<IEnumerable<ExpiryWarningDto>>> GetExpiryWarnings([FromQuery] int daysAhead = 30)
    {
        try
        {
            if (daysAhead <= 0 || daysAhead > 365)
            {
                return BadRequest(new { message = "Days ahead must be between 1 and 365" });
            }

            var warnings = await _dashboardService.GetExpiryWarningsAsync(daysAhead);
            return Ok(warnings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expiry warnings");
            return StatusCode(500, new { message = "An error occurred while retrieving expiry warnings" });
        }
    }

    [HttpGet("critical-stock")]
    public async Task<ActionResult<IEnumerable<StockSummaryDto>>> GetCriticalStockItems()
    {
        try
        {
            var criticalItems = await _dashboardService.GetCriticalStockItemsAsync();
            return Ok(criticalItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving critical stock items");
            return StatusCode(500, new { message = "An error occurred while retrieving critical stock items" });
        }
    }
}