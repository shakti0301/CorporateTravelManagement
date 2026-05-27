using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailAsync(
            string email
        )
        {
            return await _context.Users
                .FirstOrDefaultAsync(
                    x => x.Email == email
                );
        }

        public async Task<Department?> GetDepartmentAsync(
            int departmentId
        )
        {
            return await _context.Departments
                .FirstOrDefaultAsync(
                    x => x.DepartmentId == departmentId
                );
        }

        public async Task AddUserAsync(User user)
        {
            _context.Users.Add(user);

            await _context.SaveChangesAsync();
        }

        public async Task<User?> LoginUserAsync(string email, string passwordHash)
        {
            return await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(
                    x =>
                    x.Email == email &&
                    x.PasswordHash == passwordHash
                );
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            return await _context.Users
            .Include(x => x.Role)
            .Include(x => x.Department)
            .Select(x => new UserResponseDto
            {
                UserId = x.UserId,
                UserName = x.UserName,
                Email = x.Email,
                Role = x.Role!.Name,
                Department = x.Department != null
                    ? x.Department.DepartmentName
                    : null
            })
            .OrderBy(x => x.UserName)
            .ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}