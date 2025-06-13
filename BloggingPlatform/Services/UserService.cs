using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BloggingPlatform.Models;
using BloggingPlatform.Interfaces;
using BloggingPlatform.Dto.User;

namespace BloggingPlatform.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<UserResponseDto> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user?.ToResponseDto();
    }

    public async Task<UserResponseDto> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user?.ToResponseDto();
    }

    public async Task<UserResponseDto> GetByUsernameAsync(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        return user?.ToResponseDto();
    }

    public async Task<UserResponseDto> CreateAsync(UserRequestDto userDto)
    {
        if (!await _userRepository.IsEmailUniqueAsync(userDto.Email))
            throw new InvalidOperationException("Email is already in use");

        if (!await _userRepository.IsUsernameUniqueAsync(userDto.Username))
            throw new InvalidOperationException("Username is already in use");

        var user = new User
        {
            Username = userDto.Username,
            Email = userDto.Email,
            Password = PasswordHasher.HashPassword(userDto.Password),
            FirstName = userDto.FirstName,
            LastName = userDto.LastName,
            Bio = userDto.Bio,
            Role = UserRole.User,
            Status = UserStatus.Active
        };

        var createdUser = await _userRepository.CreateAsync(user);
        return createdUser.ToResponseDto();
    }

    public async Task<UserResponseDto> UpdateAsync(Guid id, UserRequestDto userDto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException("User not found");

        if (user.Email != userDto.Email && !await _userRepository.IsEmailUniqueAsync(userDto.Email))
            throw new InvalidOperationException("Email is already in use");

        if (user.Username != userDto.Username && !await _userRepository.IsUsernameUniqueAsync(userDto.Username))
            throw new InvalidOperationException("Username is already in use");

        user.Username = userDto.Username;
        user.Email = userDto.Email;
        user.FirstName = userDto.FirstName;
        user.LastName = userDto.LastName;
        user.Bio = userDto.Bio;
        user.UpdatedAt = DateTime.UtcNow;

        var updatedUser = await _userRepository.UpdateAsync(user);
        return updatedUser.ToResponseDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _userRepository.DeleteAsync(id);
    }

    public async Task<bool> UpdateLastLoginAsync(Guid userId)
    {
        return await _userRepository.UpdateLastLoginAsync(userId);
    }

    public async Task<bool> IsEmailUniqueAsync(string email)
    {
        return await _userRepository.IsEmailUniqueAsync(email);
    }

    public async Task<bool> IsUsernameUniqueAsync(string username)
    {
        return await _userRepository.IsUsernameUniqueAsync(username);
    }

    public async Task<bool> ValidateCredentialsAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) return false;

        return PasswordHasher.VerifyPassword(password, user.Password);
    }

    public async Task<bool> UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        if (!PasswordHasher.VerifyPassword(currentPassword, user.Password))
            return false;

        user.Password = PasswordHasher.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        return true;
    }
} 