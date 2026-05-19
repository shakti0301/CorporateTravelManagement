using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface ITravelRequestService
    {
        Task<string> CreateRequestAsync(int employeeId, CreateTravelRequestDto dto);
        Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>> GetDraftRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>> GetManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>>GetPMRequestsAsync(int pmId);
        Task<List<TravelRequestResponseDto>>GetPendingPMRequestsAsync(int projectManagerId);   
        Task<List<TravelRequestResponseDto>>GetPendingManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>>GetPendingFinanceRequestsAsync(int financeId);
        Task<string> ApproveOrRejectAsync(int approverId, ApprovalActionDto dto);
    }
}