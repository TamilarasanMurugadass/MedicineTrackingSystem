using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicineBatchesController : ControllerBase
{
    private readonly IMedicineBatchService _medicineBatchService;
    private readonly ILogger<MedicineBatchesController> _logger;

    public MedicineBatchesController(IMedicineBatchService medicineBatchService, ILogger<MedicineBatchesController> logger)
    {
        _medicineBatchService = medicineBatchService;
        _logger = logger;
    }

    [HttpGet()]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineBatchDto>>>> GetAllBatches()
    {
        try
        {
            var batches = await _medicineBatchService.GetAllBatchesAsync();
            return Ok(ApiResponse<IEnumerable<MedicineBatchDto>>.SuccessResponse(batches, "Medicine batches retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all medicine batches");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineBatchDto>>.ErrorResponse("An error occurred while retrieving medicine batches", 500));
        }
    }

    [HttpGet("medicine/{medicineId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineBatchDto>>>> GetBatchesByMedicine(int medicineId)
    {
        try
        {
            var batches = await _medicineBatchService.GetBatchesByMedicineAsync(medicineId);
            return Ok(ApiResponse<IEnumerable<MedicineBatchDto>>.SuccessResponse(batches, "Medicine batches retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving batches for medicine {MedicineId}", medicineId);
            return StatusCode(500, ApiResponse<IEnumerable<MedicineBatchDto>>.ErrorResponse("An error occurred while retrieving medicine batches", 500));
        }
    }

    [HttpGet("nearing-expiry")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineBatchDto>>>> GetBatchesNearingExpiry([FromQuery] int daysAhead = 90)
    {
        try
        {
            var batches = await _medicineBatchService.GetBatchesNearingExpiryAsync(daysAhead);
            return Ok(ApiResponse<IEnumerable<MedicineBatchDto>>.SuccessResponse(batches, "Batches nearing expiry retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving batches nearing expiry");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineBatchDto>>.ErrorResponse("An error occurred while retrieving batches nearing expiry", 500));
        }
    }

    [HttpGet("expired")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineBatchDto>>>> GetExpiredBatches()
    {
        try
        {
            var batches = await _medicineBatchService.GetExpiredBatchesAsync();
            return Ok(ApiResponse<IEnumerable<MedicineBatchDto>>.SuccessResponse(batches, "Expired batches retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expired batches");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineBatchDto>>.ErrorResponse("An error occurred while retrieving expired batches", 500));
        }
    }

    [HttpGet("depleted")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineBatchDto>>>> GetDepletedBatches()
    {
        try
        {
            var batches = await _medicineBatchService.GetDepletedBatchesAsync();
            return Ok(ApiResponse<IEnumerable<MedicineBatchDto>>.SuccessResponse(batches, "Depleted batches retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving depleted batches");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineBatchDto>>.ErrorResponse("An error occurred while retrieving depleted batches", 500));
        }
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<Dictionary<string, object>>>> GetBatchStatistics()
    {
        try
        {
            var statistics = await _medicineBatchService.GetBatchStatisticsAsync();
            return Ok(ApiResponse<Dictionary<string, object>>.SuccessResponse(statistics, "Batch statistics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving batch statistics");
            return StatusCode(500, ApiResponse<Dictionary<string, object>>.ErrorResponse("An error occurred while retrieving batch statistics", 500));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MedicineBatchDto>> GetBatchById(int id)
    {
        try
        {
            var batch = await _medicineBatchService.GetBatchByIdAsync(id);
            if (batch == null)
            {
                return NotFound(new { message = "Medicine batch not found" });
            }

            return Ok(batch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving medicine batch {BatchId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the medicine batch" });
        }
    }

    [HttpGet("{id}/with-transactions")]
    public async Task<ActionResult<MedicineBatchDto>> GetBatchWithTransactions(int id)
    {
        try
        {
            var batch = await _medicineBatchService.GetBatchWithTransactionsAsync(id);
            if (batch == null)
            {
                return NotFound(new { message = "Medicine batch not found" });
            }

            return Ok(batch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving medicine batch with transactions {BatchId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the medicine batch with transactions" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<MedicineBatchDto>>> CreateBatch([FromBody] CreateMedicineBatchDto createBatchDto)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<MedicineBatchDto>.ErrorResponse("User ID not found in token", 401));
            }

            // Validate expiry date
            if (createBatchDto.ExpiryDate <= DateTime.UtcNow.Date)
            {
                return BadRequest(ApiResponse<MedicineBatchDto>.ErrorResponse("Expiry date must be in the future", 400));
            }

            // Validate purchase date
            if (createBatchDto.PurchaseDate > DateTime.UtcNow.Date)
            {
                return BadRequest(ApiResponse<MedicineBatchDto>.ErrorResponse("Purchase date cannot be in the future", 400));
            }

            // Validate quantity
            if (createBatchDto.InitialQuantity <= 0)
            {
                return BadRequest(ApiResponse<MedicineBatchDto>.ErrorResponse("Initial quantity must be greater than zero", 400));
            }

            var batch = await _medicineBatchService.CreateBatchAsync(createBatchDto, currentUserId);
            _logger.LogInformation("Medicine batch {BatchNumber} created by user {UserId}", batch.BatchNumber, currentUserId);

            return CreatedAtAction(nameof(GetBatchById), new { id = batch.Id }, ApiResponse<MedicineBatchDto>.CreatedResponse(batch, "Medicine batch created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<MedicineBatchDto>.ErrorResponse(ex.Message, 400));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<MedicineBatchDto>.ErrorResponse(ex.Message, 409));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating medicine batch {BatchNumber}", createBatchDto.BatchNumber);
            return StatusCode(500, ApiResponse<MedicineBatchDto>.ErrorResponse("An error occurred while creating the medicine batch", 500));
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MedicineBatchDto>> UpdateBatch(int id, [FromBody] UpdateMedicineBatchDto updateBatchDto)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            // Validate expiry date
            if (updateBatchDto.ExpiryDate <= DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "Expiry date must be in the future" });
            }

            // Validate purchase date
            if (updateBatchDto.PurchaseDate > DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "Purchase date cannot be in the future" });
            }

            var batch = await _medicineBatchService.UpdateBatchAsync(id, updateBatchDto, currentUserId);
            if (batch == null)
            {
                return NotFound(new { message = "Medicine batch not found" });
            }

            _logger.LogInformation("Medicine batch {BatchId} updated by user {UserId}", id, currentUserId);
            return Ok(batch);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating medicine batch {BatchId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the medicine batch" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteBatch(int id)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var success = await _medicineBatchService.DeleteBatchAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(new { message = "Medicine batch not found" });
            }

            _logger.LogInformation("Medicine batch {BatchId} deleted by user {UserId}", id, currentUserId);
            return Ok(new { message = "Medicine batch deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting medicine batch {BatchId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the medicine batch" });
        }
    }
}