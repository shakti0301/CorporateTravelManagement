using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<string> RegisterAsync(RegisterDto registerDto);
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<string> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    }
}