using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;

namespace TravelMgmtApi.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DTOs.UserDropdownDto>> GetProjectManagerAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role!.Name == "ProjectManager")
                .Select(u => new UserDropdownDto
                {
                    UserId = u.UserId,
                    UserName = u.UserName
                })
                .ToListAsync();
        }
    }
}