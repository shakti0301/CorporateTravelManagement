using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface ITravelRequestRepository
    {
        Task<User?> GetEmployeeByIdAsync(int employeeId);
        Task<User?> GetManagerAsync(int managerId);
        Task<User?> GetFinanceAsync();

        Task AddRequestAsync (TravelRequest request);
        Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>> GetDraftRequestsAsync(int employeeId);
        Task<List<TravelRequestResponseDto>> GetManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>> GetPMRequestsAsync(int pmId);
        Task<List<TravelRequestResponseDto>> GetFinanceRequestsAsync(int financeId);
        Task<List<TravelRequestResponseDto>> GetPendingPMRequestsAsync(int pmId);
        Task<List<TravelRequestResponseDto>> GetPendingManagerRequestsAsync(int managerId);
        Task<List<TravelRequestResponseDto>> GetPendingFinanceRequestsAsync(int financeId);
        Task<TravelRequest?> GetRequestByIdAsync(int id);
        Task AddApprovalAsync(TravelRequestApproval approval);
        Task SaveChangesAsync();
    
        Task SaveItineraryAsync(List<ItineraryDay> days);
        Task DeleteExistingItineraryAsync(int requestId);

        Task DeleteAsync(TravelRequest request);
    }
}