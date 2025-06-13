using System;
using System.Threading.Tasks;
using BloggingPlatform.Models;
using BloggingPlatform.Dto.User;

namespace BloggingPlatform.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> GetByIdAsync(Guid id);
    Task<UserResponseDto> GetByEmailAsync(string email);
    Task<UserResponseDto> GetByUsernameAsync(string username);
    Task<UserResponseDto> CreateAsync(UserRequestDto userDto);
    Task<UserResponseDto> UpdateAsync(Guid id, UserRequestDto userDto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateLastLoginAsync(Guid userId);
    Task<bool> IsEmailUniqueAsync(string email);
    Task<bool> IsUsernameUniqueAsync(string username);
    Task<bool> ValidateCredentialsAsync(string email, string password);
    Task<bool> UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword);
} 