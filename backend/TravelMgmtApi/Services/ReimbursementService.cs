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

            if (request.Status != RequestStatus.Approved)
            {
                return "Travel request must be fully approved before submitting expenses.";
            }

            if (dto.Expenses.Count == 0)
            {
                return "At least one expense is required.";
            }

            var existing = await _repo.GetByTravelRequestIdAsync(dto.TravelRequestId);
            if (existing != null)
            {
                existing.Expenses.Clear();

                foreach (var e in dto.Expenses)
                {
                    existing.Expenses.Add(new Expense
                    {
                        Category = e.Category,
                        Date = e.Date,
                        Description = e.Description,
                        Amount = e.Amount,
                    });
                }
                existing.TotalExpense = dto.Expenses.Sum(e => e.Amount);
                existing.SubmittedAt = DateTime.UtcNow;
                await _repo.SaveChangesAsync();
                return "Reimbursement updated successfully.";
            }

            var expenses = new List<Expense>();

            foreach (var e in dto.Expenses)
            {
                expenses.Add(new Expense
                {
                    Category = e.Category,
                    Date = e.Date,
                    Description = e.Description,
                    Amount = e.Amount,
                    ProofPath = await SaveFile(e.ProofFile)
                });
            }

            var reimbursement = new Reimbursement
            {
                EmployeeId = employeeId,
                TravelRequestId = dto.TravelRequestId,
                SubmittedAt = DateTime.UtcNow,
                Status = RequestStatus.Pending,
                TotalExpense = dto.Expenses.Sum(e => e.Amount),
                Expenses = expenses
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

        //helper 
        private async Task<string?> SaveFile(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Bills");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid() +  Path.GetExtension(file.FileName);

            var path = Path.Combine(uploadsFolder, fileName);

            using(var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }
    }
}