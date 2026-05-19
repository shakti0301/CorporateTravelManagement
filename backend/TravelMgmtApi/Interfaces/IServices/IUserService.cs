using TravelMgmtApi.DTOs;

namespace TravelMgmtApi.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDropdownDto>> GetProjectManagerAsync();
    }
}