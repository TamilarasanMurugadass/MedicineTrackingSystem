using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            _logger.LogInformation("User {Email} logged in successfully", loginDto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", loginDto.Email);
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> Register([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            var user = await _authService.CreateUserAsync(createUserDto);
            _logger.LogInformation("User {Email} created successfully by {AdminId}", createUserDto.Email, User.Identity?.Name);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {Email}", createUserDto.Email);
            return StatusCode(500, new { message = "An error occurred while creating the user" });
        }
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAllUsers()
    {
        try
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(users, "Users retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResponse("An error occurred while retrieving users", 500));
        }
    }

    [HttpGet("users/active")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetActiveUsers()
    {
        try
        {
            var users = await _authService.GetActiveUsersAsync();
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(users, "Active users retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active users");
            return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResponse("An error occurred while retrieving active users", 500));
        }
    }

    [HttpGet("users/{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string id)
    {
        try
        {
            // Users can only access their own data unless they're Admin
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return StatusCode(403, ApiResponse<UserDto>.ErrorResponse("Access forbidden", 403));
            }

            var user = await _authService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<UserDto>.NotFoundResponse("User not found"));
            }

            return Ok(ApiResponse<UserDto>.SuccessResponse(user, "User retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, ApiResponse<UserDto>.ErrorResponse("An error occurred while retrieving the user", 500));
        }
    }

    [HttpPut("users/{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            // Users can only update their own data unless they're Admin
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var updatedUser = await _authService.UpdateUserAsync(id, updateUserDto);
            if (updatedUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            _logger.LogInformation("User {UserId} updated successfully", id);
            return Ok(updatedUser);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the user" });
        }
    }

    [HttpPost("users/{id}/change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            // Users can only change their own password unless they're Admin
            var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var success = await _authService.ChangePasswordAsync(id, changePasswordDto);
            if (!success)
            {
                return BadRequest(new { message = "Failed to change password. Please check your current password." });
            }

            _logger.LogInformation("Password changed successfully for user {UserId}", id);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while changing the password" });
        }
    }

    [HttpPost("users/{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateUser(string id)
    {
        try
        {
            var success = await _authService.DeactivateUserAsync(id);
            if (!success)
            {
                return NotFound(new { message = "User not found" });
            }

            _logger.LogInformation("User {UserId} deactivated by {AdminId}", id, User.Identity?.Name);
            return Ok(new { message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the user" });
        }
    }

    [HttpPost("users/{id}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ActivateUser(string id)
    {
        try
        {
            var success = await _authService.ActivateUserAsync(id);
            if (!success)
            {
                return NotFound(new { message = "User not found" });
            }

            _logger.LogInformation("User {UserId} activated by {AdminId}", id, User.Identity?.Name);
            return Ok(new { message = "User activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while activating the user" });
        }
    }
}