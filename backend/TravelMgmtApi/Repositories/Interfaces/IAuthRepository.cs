using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<Department?> GetDepartmentAsync(int departmentId);
        Task AddUserAsync(User user);
        Task<User?> LoginUserAsync(string email, string passwordHash);
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int userId);
        Task SaveChangesAsync();
        Task UpdateUserAsync(User user);
        
        Task<TravelPolicy?> GetPolicyByDepartmentAsync(int departmentId);
        Task SavePolicyAsync(TravelPolicy policy);
        Task<List<PolicyResponseDto>> GetAllPoliciesAsync();
        Task<TravelPolicy?> GetPolicyByIdAsync(int id);
    }
}