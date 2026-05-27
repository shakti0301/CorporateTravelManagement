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
        Task<string> AdminUpdateUserAsync(int userId, AdminUpdateUserDto dto);

        Task<string> AddPolicyAsync(CreatePolicyDto dto);
        Task<List<PolicyResponseDto>>GetAllPoliciesAsync();
        Task<string>UpdatePolicyAsync(int id, UpdatePolicyDto dto);

        Task<TravelPolicy?> GetPolicyByDepartmentAsync(int departmentId);
    }
}