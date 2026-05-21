using TravelMgmtApi.DTOs;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Interfaces
{
    public interface IReimbursementRepository
    {
        Task<TravelRequest?> GetTravelRequestAsync(int travelRequestId);
        Task AddExpenseAsync(Expense expense);
        Task AddReimbursementAsync(Reimbursement reimbursement);
        Task<List<ReimbursementResponseDto>> GetFinanceRequestsAsync();
        Task<List<ReimbursementResponseDto>> GetMyReimbursementsAsync(int employeeId);
        Task<Reimbursement?> GetByIdAsync(int reimbursementId);

        Task SaveChangesAsync();
    }
}