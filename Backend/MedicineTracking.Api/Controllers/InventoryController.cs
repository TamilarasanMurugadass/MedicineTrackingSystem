using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Enums;
using MedicineTracking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryTransactionDto>>>> GetAllTransactions()
    {
        try
        {
            var transactions = await _inventoryService.GetAllTransactionsAsync();
            return Ok(ApiResponse<IEnumerable<InventoryTransactionDto>>.SuccessResponse(transactions, "Inventory transactions retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all inventory transactions");
            return StatusCode(500, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("An error occurred while retrieving inventory transactions", 500));
        }
    }

    [HttpGet("transactions/{id}")]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> GetTransactionById(int id)
    {
        try
        {
            var transaction = await _inventoryService.GetTransactionByIdAsync(id);
            if (transaction == null)
            {
                return NotFound(ApiResponse<InventoryTransactionDto>.NotFoundResponse("Transaction not found"));
            }

            return Ok(ApiResponse<InventoryTransactionDto>.SuccessResponse(transaction, "Transaction retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {TransactionId}", id);
            return StatusCode(500, ApiResponse<InventoryTransactionDto>.ErrorResponse("An error occurred while retrieving the transaction", 500));
        }
    }

    [HttpGet("transactions/batch/{batchId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryTransactionDto>>>> GetTransactionsByBatch(int batchId)
    {
        try
        {
            var transactions = await _inventoryService.GetTransactionsByBatchAsync(batchId);
            return Ok(ApiResponse<IEnumerable<InventoryTransactionDto>>.SuccessResponse(transactions, "Batch transactions retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for batch {BatchId}", batchId);
            return StatusCode(500, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("An error occurred while retrieving batch transactions", 500));
        }
    }

    [HttpGet("transactions/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryTransactionDto>>>> GetTransactionsByUser(string userId)
    {
        try
        {
            // Users can only view their own transactions unless they're Admin or Pharmacist
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (currentUserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Pharmacist"))
            {
                return StatusCode(403, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("Access forbidden", 403));
            }

            var transactions = await _inventoryService.GetTransactionsByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<InventoryTransactionDto>>.SuccessResponse(transactions, "User transactions retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for user {UserId}", userId);
            return StatusCode(500, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("An error occurred while retrieving user transactions", 500));
        }
    }

    [HttpGet("transactions/type/{type}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryTransactionDto>>>> GetTransactionsByType(TransactionType type)
    {
        try
        {
            var transactions = await _inventoryService.GetTransactionsByTypeAsync(type);
            return Ok(ApiResponse<IEnumerable<InventoryTransactionDto>>.SuccessResponse(transactions, "Transactions by type retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions by type {TransactionType}", type);
            return StatusCode(500, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("An error occurred while retrieving transactions by type", 500));
        }
    }

    [HttpGet("transactions/date-range")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryTransactionDto>>>> GetTransactionsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            if (startDate > endDate)
            {
                return BadRequest(ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("Start date cannot be after end date", 400));
            }

            var transactions = await _inventoryService.GetTransactionsByDateRangeAsync(startDate, endDate);
            return Ok(ApiResponse<IEnumerable<InventoryTransactionDto>>.SuccessResponse(transactions, "Transactions by date range retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions by date range {StartDate} to {EndDate}", startDate, endDate);
            return StatusCode(500, ApiResponse<IEnumerable<InventoryTransactionDto>>.ErrorResponse("An error occurred while retrieving transactions by date range", 500));
        }
    }

    [HttpPost("transactions")]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> RecordTransaction([FromBody] CreateInventoryTransactionDto createTransactionDto)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<InventoryTransactionDto>.ErrorResponse("User ID not found in token", 401));
            }

            // Validate quantity
            if (createTransactionDto.Quantity <= 0)
            {
                return BadRequest(ApiResponse<InventoryTransactionDto>.ErrorResponse("Quantity must be greater than zero", 400));
            }

            var transaction = await _inventoryService.RecordTransactionAsync(createTransactionDto, currentUserId);
            _logger.LogInformation("Inventory transaction recorded by user {UserId}: {TransactionType} {Quantity}",
                currentUserId, createTransactionDto.TransactionType, createTransactionDto.Quantity);

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, ApiResponse<InventoryTransactionDto>.CreatedResponse(transaction, "Transaction recorded successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<InventoryTransactionDto>.ErrorResponse(ex.Message, 400));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<InventoryTransactionDto>.ErrorResponse(ex.Message, 400));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording inventory transaction");
            return StatusCode(500, ApiResponse<InventoryTransactionDto>.ErrorResponse("An error occurred while recording the transaction", 500));
        }
    }

    [HttpPost("withdraw")]
    public async Task<ActionResult<ApiResponse<object>>> WithdrawMedicine([FromBody] WithdrawMedicineRequest request)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("User ID not found in token", 401));
            }

            // Validate quantity
            if (request.Quantity <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Quantity must be greater than zero", 400));
            }

            var success = await _inventoryService.WithdrawMedicineAsync(
                request.BatchId,
                request.Quantity,
                request.Reason,
                request.PatientReference,
                request.Notes,
                currentUserId);
            Console.WriteLine("Tamil Withdraw: " + success);
            if (!success)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to withdraw medicine. Please check stock availability."));
            }

            _logger.LogInformation("Medicine withdrawn by user {UserId}: Batch {BatchId}, Quantity {Quantity}",
                currentUserId, request.BatchId, request.Quantity);

            return Ok(ApiResponse<object>.SuccessResponse(new { }, "Medicine withdrawn successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error withdrawing medicine from batch {BatchId}", request.BatchId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while withdrawing medicine", 500));
        }
    }

    [HttpPost("adjust-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<object>>> AdjustStock([FromBody] AdjustStockRequest request)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("User ID not found in token", 401));
            }

            var success = await _inventoryService.AdjustStockAsync(
                request.BatchId,
                request.Adjustment,
                request.Reason,
                request.Notes,
                currentUserId);

            if (!success)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to adjust stock. Please check the adjustment amount.", 400));
            }

            _logger.LogInformation("Stock adjusted by user {UserId}: Batch {BatchId}, Adjustment {Adjustment}",
                currentUserId, request.BatchId, request.Adjustment);

            return Ok(ApiResponse<object>.SuccessResponse(new { }, "Stock adjusted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adjusting stock for batch {BatchId}", request.BatchId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while adjusting stock", 500));
        }
    }

    [HttpPost("mark-expired")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsExpired([FromBody] MarkExpiredRequest request)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("User ID not found in token", 401));
            }

            var success = await _inventoryService.MarkAsExpiredAsync(request.BatchId, request.Notes, currentUserId);
            if (!success)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to mark batch as expired", 400));
            }

            _logger.LogInformation("Batch {BatchId} marked as expired by user {UserId}", request.BatchId, currentUserId);
            return Ok(ApiResponse<object>.SuccessResponse(new { }, "Batch marked as expired successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking batch {BatchId} as expired", request.BatchId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while marking batch as expired", 500));
        }
    }

    [HttpPost("mark-damaged")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsDamaged([FromBody] MarkDamagedRequest request)
    {
        try
        {
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("User ID not found in token", 401));
            }

            // Validate quantity
            if (request.Quantity <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Quantity must be greater than zero", 400));
            }

            var success = await _inventoryService.MarkAsDamagedAsync(
                request.BatchId,
                request.Quantity,
                request.Reason,
                request.Notes,
                currentUserId);

            if (!success)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to mark items as damaged", 400));
            }

            _logger.LogInformation("Damaged items recorded by user {UserId}: Batch {BatchId}, Quantity {Quantity}",
                currentUserId, request.BatchId, request.Quantity);

            return Ok(ApiResponse<object>.SuccessResponse(new { }, "Items marked as damaged successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking items as damaged for batch {BatchId}", request.BatchId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while marking items as damaged", 500));
        }
    }

    [HttpGet("usage-summary")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UsageSummaryDto>>>> GetUsageSummary(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var summary = await _inventoryService.GetUsageSummaryAsync(startDate, endDate);
            return Ok(ApiResponse<IEnumerable<UsageSummaryDto>>.SuccessResponse(summary, "Usage summary retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage summary");
            return StatusCode(500, ApiResponse<IEnumerable<UsageSummaryDto>>.ErrorResponse("An error occurred while retrieving usage summary", 500));
        }
    }

    [HttpGet("usage-summary/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UsageSummaryDto>>>> GetUsageSummaryByUser(
        string userId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            // Users can only view their own summary unless they're Admin or Pharmacist
            var currentUserId =
                User.FindFirst("sub")?.Value ??
                User.FindFirst("id")?.Value ??
                User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (currentUserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Pharmacist"))
            {
                return StatusCode(403, ApiResponse<IEnumerable<UsageSummaryDto>>.ErrorResponse("Access forbidden", 403));
            }

            var summary = await _inventoryService.GetUsageSummaryByUserAsync(userId, startDate, endDate);
            return Ok(ApiResponse<IEnumerable<UsageSummaryDto>>.SuccessResponse(summary, "User usage summary retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage summary for user {UserId}", userId);
            return StatusCode(500, ApiResponse<IEnumerable<UsageSummaryDto>>.ErrorResponse("An error occurred while retrieving usage summary", 500));
        }
    }

    [HttpGet("usage-summary/medicine/{medicineId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UsageSummaryDto>>>> GetUsageSummaryByMedicine(
        int medicineId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var summary = await _inventoryService.GetUsageSummaryByMedicineAsync(medicineId, startDate, endDate);
            return Ok(ApiResponse<IEnumerable<UsageSummaryDto>>.SuccessResponse(summary, "Medicine usage summary retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage summary for medicine {MedicineId}", medicineId);
            return StatusCode(500, ApiResponse<IEnumerable<UsageSummaryDto>>.ErrorResponse("An error occurred while retrieving usage summary", 500));
        }
    }
}

// Request DTOs for inventory operations
public class WithdrawMedicineRequest
{
    public int BatchId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? PatientReference { get; set; }
    public string? Notes { get; set; }
}

public class AdjustStockRequest
{
    public int BatchId { get; set; }
    public int Adjustment { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class MarkExpiredRequest
{
    public int BatchId { get; set; }
    public string? Notes { get; set; }
}

public class MarkDamagedRequest
{
    public int BatchId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}