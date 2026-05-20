using TravelMgmtApi.DTOs;

namespace TravelMgmtApi.Interfaces
{
    public interface IReimbursementService
    {
        Task<string> SubmitAsync (int employeeId, SubmitReimbursementDto dto);
        Task<List<ReimbursementResponseDto>> GetFinanceRequestsAsync ();
        Task<List<ReimbursementResponseDto>> GetMyReimbursementsAsync (int employeeId);
        Task<string> ApproveAsync (ReimbursementActionDto dto);
        Task<string> RejectAsync (ReimbursementActionDto dto);
    }
}