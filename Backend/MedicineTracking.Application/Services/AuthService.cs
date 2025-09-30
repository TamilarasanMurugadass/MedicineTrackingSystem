using AutoMapper;
using MedicineTracking.Application.DTOs;
using MedicineTracking.Application.Interfaces;
using MedicineTracking.Domain.Entities;
using MedicineTracking.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MedicineTracking.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        UserManager<User> userManager,
        IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null || !user.IsActive)
            return null;

        var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!passwordValid)
            return null;

        var token = await GenerateJwtTokenAsync(user);
        var userDto = _mapper.Map<UserDto>(user);

        return new LoginResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(12),
            User = userDto
        };
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        // Check if email is unique
        var emailUnique = await IsEmailUniqueAsync(createUserDto.Email);
        if (!emailUnique)
            throw new InvalidOperationException("Email already exists");

        // Check if username is unique
        var usernameUnique = await IsUserNameUniqueAsync(createUserDto.UserName);
        if (!usernameUnique)
            throw new InvalidOperationException("Username already exists");

        // Validate role exists
        var role = await _unitOfWork.Roles.GetByIdAsync(createUserDto.RoleId);
        if (role == null)
            throw new ArgumentException("Invalid role");

        var user = _mapper.Map<User>(createUserDto);
        user.SecurityStamp = Guid.NewGuid().ToString();

        var result = await _userManager.CreateAsync(user, createUserDto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user: {errors}");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<IEnumerable<UserDto>> GetActiveUsersAsync()
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.IsActive);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto?> UpdateUserAsync(string userId, UpdateUserDto updateDto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        // Check email uniqueness if changed
        if (user.Email != updateDto.Email)
        {
            var emailUnique = await IsEmailUniqueAsync(updateDto.Email, userId);
            if (!emailUnique)
                throw new InvalidOperationException("Email already exists");
        }

        // Check username uniqueness if changed
        if (user.UserName != updateDto.UserName)
        {
            var usernameUnique = await IsUserNameUniqueAsync(updateDto.UserName, userId);
            if (!usernameUnique)
                throw new InvalidOperationException("Username already exists");
        }

        // Validate role exists if changed
        if (user.RoleId != updateDto.RoleId)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(updateDto.RoleId);
            if (role == null)
                throw new ArgumentException("Invalid role");
        }

        _mapper.Map(updateDto, user);
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to update user: {errors}");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
        return result.Succeeded;
    }

    public async Task<bool> DeactivateUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ActivateUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> IsEmailUniqueAsync(string email, string? excludeUserId = null)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return true;

        return excludeUserId != null && user.Id == excludeUserId;
    }

    public async Task<bool> IsUserNameUniqueAsync(string userName, string? excludeUserId = null)
    {
        var user = await _userManager.FindByNameAsync(userName);
        if (user == null) return true;

        return excludeUserId != null && user.Id == excludeUserId;
    }

    private async Task<string> GenerateJwtTokenAsync(User user)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, role?.Name ?? "User"),
            new("RoleId", user.RoleId.ToString()),
            new("IsActive", user.IsActive.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"] ?? "DefaultSecretKey"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}