using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface ITravelRequestService
    {
        Task<string> CreateRequestAsync(int employeeId, CreateTravelRequestDto dto);
        Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>>GetPendingManagerRequestsAsync(int managerId);
        Task<string> ApproveOrRejectAsync(int approverId, ApprovalActionDto dto);
    }
}