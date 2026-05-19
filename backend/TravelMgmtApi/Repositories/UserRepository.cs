using System.Drawing;
using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;

namespace TravelMgmtApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDropdownDto>> GetProjectManagerAsync()
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