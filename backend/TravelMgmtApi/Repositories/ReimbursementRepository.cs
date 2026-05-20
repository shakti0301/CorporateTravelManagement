using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Services
{
    public class ReimbursementRepository : IReimbursementRepository
    {
        private readonly AppDbContext _context;

        public ReimbursementRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TravelRequest?> GetTravelRequestAsync(int travelRequestId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.Employee)
                .FirstOrDefaultAsync(x => x.TravelRequestId == travelRequestId);
        }

        public async Task AddReimbursementAsync(Reimbursement reimbursement)
        {
            await _context.Reimbursements.AddAsync(reimbursement);
        }

        public async Task<List<ReimbursementResponseDto>> GetFinanceRequestsAsync()
        {
            return await _context.Reimbursements
                .Include(r => r.TravelRequest)
                .ThenInclude(t => t.Employee)

                .Include(r => r.Expenses)
                .OrderByDescending(r => r.SubmittedAt)

                .Select(r => 
                    new ReimbursementResponseDto
                    {
                        ReimbursementId = r.ReimbursementId,
                        TravelRequestId = r.TravelRequestId,
                        EmployeeName = r.TravelRequest!.Employee!.UserName,
                        Purpose = r.TravelRequest.Purpose,
                        Source = r.TravelRequest.Source,
                        Destination = r.TravelRequest.Destination,
                        TotalExpense = r.TotalExpense,
                        Status = r.Status.ToString(),
                        Remarks = r.Remarks,
                        SubmittedAt = r.SubmittedAt,

                        Expenses = r. Expenses.Select(e => new ExpenseResponseDto
                        {
                            ExpenseId = e.ExpenseId,
                            Category = e.Category,
                            Description = e.Description,
                            Amount = e.Amount,
                            Date = e.Date,
                            ProofPath = e.ProofPath
                        })
                        .ToList()
                    })
                .ToListAsync();
        }

        public async Task<List<ReimbursementResponseDto>> GetMyReimbursementsAsync(int employeeId)
        {
            return await _context.Reimbursements
                .Include(r => r.TravelRequest)
                .Where(r => r.TravelRequest!.EmployeeId == employeeId)
                .Select(r => new ReimbursementResponseDto
                {
                    ReimbursementId = r.ReimbursementId,
                    TravelRequestId = r.TravelRequestId,
                    Destination = r.TravelRequest!.Destination,
                    Source = r.TravelRequest!.Source,
                    Purpose = r.TravelRequest.Purpose,
                    TotalExpense = r.TotalExpense,
                    Status = r.Status.ToString(),
                    Remarks = r.Remarks,
                    SubmittedAt = r.SubmittedAt
                })
                .ToListAsync();
        }

        public async Task<Reimbursement?> GetByIdAsync(int reimbursementId)
        {
            return await _context.Reimbursements
                .FirstOrDefaultAsync(r => r.ReimbursementId == reimbursementId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}