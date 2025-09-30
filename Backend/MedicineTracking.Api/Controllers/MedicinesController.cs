using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicinesController : ControllerBase
{
    private readonly IMedicineService _medicineService;
    private readonly ILogger<MedicinesController> _logger;

    public MedicinesController(IMedicineService medicineService, ILogger<MedicinesController> logger)
    {
        _medicineService = medicineService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<MedicineDto>>>> GetAllMedicines()
    {
        try
        {
            var medicines = await _medicineService.GetAllMedicinesAsync();
            return Ok(ApiResponse<IEnumerable<MedicineDto>>.SuccessResponse(medicines, "Medicines retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all medicines");
            return StatusCode(500, ApiResponse<IEnumerable<MedicineDto>>.ErrorResponse("An error occurred while retrieving medicines"));
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> GetActiveMedicines()
    {
        try
        {
            var medicines = await _medicineService.GetActiveMedicinesAsync();
            return Ok(medicines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active medicines");
            return StatusCode(500, new { message = "An error occurred while retrieving active medicines" });
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> GetLowStockMedicines()
    {
        try
        {
            var medicines = await _medicineService.GetLowStockMedicinesAsync();
            return Ok(medicines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving low stock medicines");
            return StatusCode(500, new { message = "An error occurred while retrieving low stock medicines" });
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> SearchMedicines([FromQuery] string searchTerm)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(new { message = "Search term cannot be empty" });
            }

            var medicines = await _medicineService.SearchMedicinesAsync(searchTerm);
            return Ok(medicines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching medicines with term {SearchTerm}", searchTerm);
            return StatusCode(500, new { message = "An error occurred while searching medicines" });
        }
    }

    [HttpGet("stock-summary")]
    public async Task<ActionResult<Dictionary<string, int>>> GetStockSummary()
    {
        try
        {
            var summary = await _medicineService.GetMedicineStockSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stock summary");
            return StatusCode(500, new { message = "An error occurred while retrieving stock summary" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MedicineDto>> GetMedicineById(int id)
    {
        try
        {
            var medicine = await _medicineService.GetMedicineByIdAsync(id);
            if (medicine == null)
            {
                return NotFound(new { message = "Medicine not found" });
            }

            return Ok(medicine);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving medicine {MedicineId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the medicine" });
        }
    }

    [HttpGet("{id}/with-batches")]
    public async Task<ActionResult<MedicineDto>> GetMedicineWithBatches(int id)
    {
        try
        {
            var medicine = await _medicineService.GetMedicineWithBatchesAsync(id);
            if (medicine == null)
            {
                return NotFound(new { message = "Medicine not found" });
            }

            return Ok(medicine);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving medicine with batches {MedicineId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the medicine with batches" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<MedicineDto>>> CreateMedicine([FromBody] CreateMedicineDto createMedicineDto)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ??
                               User.FindFirst("id")?.Value ??
                               User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            Console.WriteLine("Current User ID: " + currentUserId);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<MedicineDto>.ErrorResponse("User ID not found in token"));
            }
            // Check if medicine name is unique
            var isUnique = await _medicineService.IsMedicineNameUniqueAsync(createMedicineDto.Name);
            if (!isUnique)
            {
                return Conflict(ApiResponse<MedicineDto>.ErrorResponse("A medicine with this name already exists"));
            }

            var medicine = await _medicineService.CreateMedicineAsync(createMedicineDto, currentUserId);
            _logger.LogInformation("Medicine {MedicineName} created by user {UserId}", medicine.Name, currentUserId);

            return CreatedAtAction(nameof(GetMedicineById), new { id = medicine.Id }, ApiResponse<MedicineDto>.CreatedResponse(medicine, "Medicine created successfully"));
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception: " + ex.Message);
            _logger.LogError(ex, "Error creating medicine {MedicineName}", createMedicineDto.Name);
            return StatusCode(500, ApiResponse<MedicineDto>.ErrorResponse("An error occurred while creating the medicine"));
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<MedicineDto>>> UpdateMedicine(int id, [FromBody] UpdateMedicineDto updateMedicineDto)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ??
                               User.FindFirst("id")?.Value ??
                               User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(ApiResponse<MedicineDto>.ErrorResponse("User ID not found in token"));
            }

            // Check if medicine name is unique (excluding current medicine)
            var isUnique = await _medicineService.IsMedicineNameUniqueAsync(updateMedicineDto.Name, id);
            if (!isUnique)
            {
                return Conflict(ApiResponse<MedicineDto>.ErrorResponse("A medicine with this name already exists"));
            }

            var medicine = await _medicineService.UpdateMedicineAsync(id, updateMedicineDto, currentUserId);
            if (medicine == null)
            {
                return NotFound(ApiResponse<MedicineDto>.ErrorResponse("Medicine not found"));
            }

            _logger.LogInformation("Medicine {MedicineId} updated by user {UserId}", id, currentUserId);
            return Ok(ApiResponse<MedicineDto>.SuccessResponse(medicine, "Medicine updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating medicine {MedicineId}", id);
            return StatusCode(500, ApiResponse<MedicineDto>.ErrorResponse("An error occurred while updating the medicine"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteMedicine(int id)
    {
        try
        {
            var currentUserId = User.FindFirst("sub")?.Value ??
                               User.FindFirst("id")?.Value ??
                               User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var success = await _medicineService.DeleteMedicineAsync(id, currentUserId);
            if (!success)
            {
                return NotFound(new { message = "Medicine not found" });
            }

            _logger.LogInformation("Medicine {MedicineId} deleted by user {UserId}", id, currentUserId);
            return Ok(new { message = "Medicine deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting medicine {MedicineId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the medicine" });
        }
    }
}