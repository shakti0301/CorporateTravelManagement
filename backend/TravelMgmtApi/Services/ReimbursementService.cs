using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;
using TravelMgmtApi.Enums;

namespace TravelMgmtApi.Services
{
    public class ReimbursementService : IReimbursementService
    {
        private readonly IReimbursementRepository _repo;

        public ReimbursementService(IReimbursementRepository repo)
        {
            _repo = repo;
        }

        public async Task<string> SubmitAsync (int employeeId, SubmitReimbursementDto dto)
        {
            var request = await _repo.GetTravelRequestAsync(dto.TravelRequestId);

            if (request == null)
            {
                return "Travel request not found.";
            }
            if (request.EmployeeId != employeeId)
            {
                return "Unauthorized";
            }
            var existing = await _repo.GetFinanceRequestsAsync();

            if(existing.Any(x => x.TravelRequestId == dto.TravelRequestId))
            {
                return "Reimbursement already submitted";
            }
            
            if (dto.Expenses.Count == 0)
            {
                return "At least one expense is required.";
            }

            var reimbursement = new Reimbursement
            {
                EmployeeId = employeeId,
                TravelRequestId = dto.TravelRequestId,
                SubmittedAt = DateTime.UtcNow,
                Status = RequestStatus.Pending,
                TotalExpense = dto.Expenses.Sum(e => e.Amount),
                Expenses = dto.Expenses.Select(e => new Expense
                {
                    Category = e.Category,
                    Date = e.Date,
                    Description = e.Description,
                    Amount = e.Amount,
                    ProofPath = e.ProofPath
                })
                .ToList()
            };
            await _repo.AddReimbursementAsync(reimbursement);
            await _repo.SaveChangesAsync();
            return "Reimbursement submitted successfully.";
        }

        //Finance page
        public async Task<List<ReimbursementResponseDto>> GetFinanceRequestsAsync()
        {
            return await _repo.GetFinanceRequestsAsync();
        }

        //Employee page
        public async Task<List<ReimbursementResponseDto>> GetMyReimbursementsAsync(int employeeId)
        {
            return await _repo.GetMyReimbursementsAsync(employeeId);
        }

        //Finance approve
        public async Task<string> ApproveAsync (ReimbursementActionDto dto)
        {
            var reimbursement = await _repo.GetByIdAsync(dto.ReimbursementId);

            if(reimbursement == null)
            {
                return "Reimbursement request not found.";
            }

            reimbursement.Status = RequestStatus.Approved;

            reimbursement.Remarks = dto.Remarks;

            await _repo.SaveChangesAsync();
            return "Approved";
        }

        //Finance reject
        public async Task<string> RejectAsync (ReimbursementActionDto dto)
        {
            var reimbursement = await _repo.GetByIdAsync(dto.ReimbursementId);

            if(reimbursement == null)
            {
                return "Reimbursement request not found.";
            }

            reimbursement.Status = RequestStatus.Rejected;

            reimbursement.Remarks = dto.Remarks;

            await _repo.SaveChangesAsync();
            return "Rejected";
        }
    }
}