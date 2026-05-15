using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface ITravelRequestService
    {
        Task<string> CreateRequestAsync(int employeeId, CreateTravelRequestDto dto);
        Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId);
    }
}