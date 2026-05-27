using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface ITravelRequestService
    {
        Task<string> CreateRequestAsync(int employeeId, CreateTravelRequestDto dto);
        Task<string> UpdateDraftAsync(int id, CreateTravelRequestDto dto);
        Task<string> SubmitDraftAsync(int id);
        Task<string> DeleteRequestAsync(int id);
        Task<string> CancelRequestAsync(int id);
        Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>> GetDraftRequestsAsync(int employeeId);
        Task<TravelRequestResponseDto?> GetByIdAsync(int requestId);
        Task<List<TravelRequestResponseDto>> GetManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>>GetPMRequestsAsync(int pmId);
        Task<List<TravelRequestResponseDto>>GetFinanceRequestsAsync(int financeId);
        Task<List<TravelRequestResponseDto>>GetPendingPMRequestsAsync(int projectManagerId);   
        Task<List<TravelRequestResponseDto>>GetPendingManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>>GetPendingFinanceRequestsAsync(int financeId);
        Task<List<AdminTravelRequestDto>> GetAllRequestsForAdminAsync();

        Task<string> ApproveOrRejectAsync(int approverId, ApprovalActionDto dto);
        Task<string> SaveItineraryAsync(CreateItineraryDto dto);
    }
}