using MedicineTracking.Application.DTOs;

namespace MedicineTracking.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto?> GetUserByIdAsync(string userId);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<IEnumerable<UserDto>> GetActiveUsersAsync();
    Task<UserDto?> UpdateUserAsync(string userId, UpdateUserDto updateDto);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
    Task<bool> DeactivateUserAsync(string userId);
    Task<bool> ActivateUserAsync(string userId);
    Task<bool> IsEmailUniqueAsync(string email, string? excludeUserId = null);
    Task<bool> IsUserNameUniqueAsync(string userName, string? excludeUserId = null);
}