using TravelMgmtApi.DTOs;

namespace TravelMgmtApi.Interfaces
{
    public interface IUserRepository
    {
        Task<List<UserDropdownDto>> GetProjectManagerAsync();
    }
}