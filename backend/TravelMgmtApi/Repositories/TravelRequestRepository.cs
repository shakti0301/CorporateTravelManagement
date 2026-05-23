using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Enums;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Repositories
{
    public class TravelRequestRepository : ITravelRequestRepository
    {
        private readonly AppDbContext _context;

        public TravelRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetEmployeeByIdAsync(int employeeId)
        {
            return await _context.Users
                .Include(x => x.Department)
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.UserId == employeeId);
        }

        public async Task<User?> GetManagerAsync(int managerId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == managerId);
        }

        public async Task<User?> GetFinanceAsync()
        {
            return await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.Role!.Name == "Finance");
        }

        public async Task AddRequestAsync(TravelRequest request)
        {
            await _context.TravelRequests.AddAsync(request);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        
        public async Task<TravelRequest?> GetRequestByIdAsync(int id)
        {
            return await _context.TravelRequests
                .Include(tr => tr.Employee)
                .Include(tr => tr.ProjectManager)
                .FirstOrDefaultAsync(x => x.TravelRequestId == id);
        }

        public async Task AddApprovalAsync(TravelRequestApproval approval)
        {
            await _context.TravelRequestApprovals.AddAsync(approval);
        }

        public async Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId)
        {
            return await _context.TravelRequests
            .Where( tr => tr.EmployeeId == employeeId && !tr.IsDraft )
            .Include(tr => tr.Employee)
            .Include(tr => tr.Approvals)
            .Include(tr => tr.ProjectManager)

            .OrderByDescending(tr => tr.CreatedAt)
            .Select( tr => new TravelRequestResponseDto
            {
                TravelRequestId = tr.TravelRequestId,
                EmployeeName = tr.Employee!.UserName,
                Source = tr.Source,
                Destination = tr.Destination,
                Purpose = tr.Purpose,
                StartDate = tr.StartDate,
                EndDate = tr.EndDate,
                EstimatedCost = tr.EstimatedCost,
                Status = tr.Status.ToString(),
                IsDraft = tr.IsDraft,
                CurrentStage = tr.CurrentStage.ToString(),
                Comments = tr.Approvals
                    .OrderByDescending(a => a.ActionDate)
                    .Select(a => a.Comments)
                    .FirstOrDefault(),
                CreatedAt = tr.CreatedAt,
                PmEmail = (tr.ProjectManagerId == null || tr.ProjectManagerId == 0)
                    ? null
                    : tr.ProjectManager!.Email,
                PmStatus = (tr.ProjectManagerId == null || tr.ProjectManagerId == 0)
                    ? "not_applicable"
                    : tr.Approvals
                        .Where(a => a.ApprovalStage == ApprovalStage.ProjectManager)
                        .OrderByDescending(a => a.ActionDate)
                        .Select(a => a.Status.ToString())
                        .FirstOrDefault()
                        ?? (
                            tr.CurrentStage == ApprovalStage.ProjectManager
                                ? "Pending"
                                : "not_applicable"
                        ),

                ManagerStatus =
                    tr.CurrentStage == ApprovalStage.ProjectManager
                        ? "not_applicable"
                        : tr.CurrentStage == ApprovalStage.Manager
                            ? "Pending"
                            : tr.CurrentStage == ApprovalStage.Finance ||
                            tr.Status == RequestStatus.Approved
                                ? "Approved"
                                : tr.Status == RequestStatus.Rejected &&
                                tr.Approvals.Any(a => a.ApprovalStage == ApprovalStage.Manager && a.Status == RequestStatus.Rejected)
                                    ? "Rejected"
                                    : "not_applicable",

                FinanceStatus =
                    tr.CurrentStage == ApprovalStage.Finance
                        ? "Pending"
                        : tr.Status == RequestStatus.Approved
                            ? "Approved"
                            : tr.Status == RequestStatus.Rejected &&
                            tr.Approvals.Any(a => a.ApprovalStage==ApprovalStage.Finance && a.Status == RequestStatus.Rejected)
                                ? "Rejected"
                                : "not_applicable",
            })
            .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>> GetDraftRequestsAsync(int employeeId)
        {
            return await _context.TravelRequests
            .Include(tr=>tr.Employee)
            .Where(tr =>
                tr.EmployeeId==employeeId &&
                tr.IsDraft==true
            )
            .Select(tr =>
                new TravelRequestResponseDto
                {
                    TravelRequestId = tr.TravelRequestId,
                    EmployeeName = tr.Employee!.UserName,
                    Source = tr.Source,
                    Destination = tr.Destination,
                    Purpose = tr.Purpose,
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    EstimatedCost = tr.EstimatedCost,
                    Status = tr.Status.ToString(),
                    CurrentStage = tr.CurrentStage.ToString(),
                    IsDraft = tr.IsDraft,
                    Comments = tr.Approvals
                        .OrderByDescending(a => a.ActionDate)
                        .Select(a => a.Comments)
                        .FirstOrDefault(),
                    CreatedAt = tr.CreatedAt
                })
            .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>> GetManagerRequestsAsync(int managerId)
        {
            return await _context.TravelRequests
            .Include(tr => tr.Employee)
            .Include(tr => tr.Approvals)
            .Where(tr => tr.ManagerId == managerId && !tr.IsDraft)
            .OrderByDescending(tr => tr.CreatedAt)
            .Select(tr=>new TravelRequestResponseDto{
                TravelRequestId=tr.TravelRequestId,
                EmployeeName=tr.Employee!.UserName,
                Source=tr.Source,
                Destination=tr.Destination,
                StartDate=tr.StartDate,
                EndDate=tr.EndDate,
                Purpose=tr.Purpose,
                EstimatedCost=tr.EstimatedCost,
                Status=tr.Status.ToString(),
                CurrentStage=tr.CurrentStage.ToString(),
                Comments = tr.Approvals
                    .OrderByDescending(a => a.ActionDate)
                    .Select(a => a.Comments)
                    .FirstOrDefault(),
                CreatedAt=tr.CreatedAt,
                IsDraft=tr.IsDraft
            })
            .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>>GetPMRequestsAsync(int pmId)
        {
            return await _context.TravelRequests
                .Include(tr=>tr.Employee)
                .Include(tr => tr.Approvals)
                .Where(tr=>tr.ProjectManagerId==pmId && !tr.IsDraft)
                .OrderByDescending(tr=>tr.CreatedAt)
                .Select(tr=>new TravelRequestResponseDto{

                    TravelRequestId=tr.TravelRequestId,
                    EmployeeName=tr.Employee!.UserName,
                    Source=tr.Source,
                    Destination=tr.Destination,
                    StartDate=tr.StartDate,
                    EndDate=tr.EndDate,
                    Purpose=tr.Purpose,
                    EstimatedCost=tr.EstimatedCost,
                    Status=tr.Status.ToString(),
                    CurrentStage=tr.CurrentStage.ToString(),
                    Comments = tr.Approvals
                        .OrderByDescending(a => a.ActionDate)
                        .Select(a => a.Comments)
                        .FirstOrDefault(),
                    CreatedAt=tr.CreatedAt,
                    IsDraft=tr.IsDraft
                })
                .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>>GetFinanceRequestsAsync(int financeId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.Employee)
                .Include(tr => tr.Approvals)
                .Where(tr => tr.FinanceId == financeId && !tr.IsDraft)
                .OrderByDescending(tr => tr.CreatedAt)
                .Select(tr => new TravelRequestResponseDto
                {
                    TravelRequestId = tr.TravelRequestId,
                    EmployeeName = tr.Employee!.UserName,
                    Source = tr.Source,
                    Destination = tr.Destination,
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    Purpose = tr.Purpose,
                    EstimatedCost = tr.EstimatedCost,
                    Status = tr.Status.ToString(),
                    CurrentStage = tr.CurrentStage.ToString(),
                    Comments = tr.Approvals
                        .OrderByDescending(a => a.ActionDate)
                        .Select(a => a.Comments)
                        .FirstOrDefault(),
                    CreatedAt = tr.CreatedAt,
                    IsDraft = tr.IsDraft
                })
                .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>> GetPendingPMRequestsAsync(int pmId)
        {
            return await _context.TravelRequests
            .Include(tr => tr.Employee)
            .Include(tr => tr.Approvals)
            .Where(tr =>
                tr.ProjectManagerId == pmId &&
                tr.CurrentStage == ApprovalStage.ProjectManager &&
                tr.Status == RequestStatus.Pending &&
                !tr.IsDraft

            )
            .Select(tr =>
                new TravelRequestResponseDto
                {
                    TravelRequestId = tr.TravelRequestId,
                    EmployeeName = tr.Employee!.UserName,
                    Source = tr.Source,
                    Destination = tr.Destination,
                    Purpose = tr.Purpose,
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    EstimatedCost = tr.EstimatedCost,
                    Status = tr.Status.ToString(),
                    CurrentStage = tr.CurrentStage.ToString(),
                    Comments = tr.Approvals
                        .OrderByDescending(a => a.ActionDate)
                        .Select(a => a.Comments)
                        .FirstOrDefault(),
                    CreatedAt =tr.CreatedAt,
                    IsDraft = tr.IsDraft
                })
            .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>> GetPendingManagerRequestsAsync(int managerId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.Employee)
                .Include(tr => tr.Approvals)
                .Where(tr =>
                    tr.ManagerId == managerId &&
                    tr.CurrentStage == ApprovalStage.Manager &&
                    tr.Status == RequestStatus.Pending &&
                    !tr.IsDraft
                )

                .Select(tr =>
                    new TravelRequestResponseDto
                    {
                        TravelRequestId = tr.TravelRequestId,
                        EmployeeName = tr.Employee!.UserName,
                        Source = tr.Source,
                        Destination = tr.Destination,
                        Purpose = tr.Purpose,
                        StartDate = tr.StartDate,
                        EndDate = tr.EndDate,
                        EstimatedCost = tr.EstimatedCost,
                        Status = tr.Status.ToString(),
                        CurrentStage = tr.CurrentStage.ToString(),
                        Comments = tr.Approvals
                            .OrderByDescending(a => a.ActionDate)
                            .Select(a => a.Comments)
                            .FirstOrDefault(),
                        CreatedAt = tr.CreatedAt,
                        IsDraft = tr.IsDraft
                    })
                .ToListAsync();
        }

        public async Task<List<TravelRequestResponseDto>> GetPendingFinanceRequestsAsync(int financeId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.Employee)
                .Include(tr => tr.Approvals)
                .Where(tr =>
                    tr.FinanceId == financeId &&
                    tr.CurrentStage == ApprovalStage.Finance &&
                    tr.Status == RequestStatus.Pending &&
                    !tr.IsDraft
                )
                .Select(tr =>
                    new TravelRequestResponseDto
                    {
                        TravelRequestId = tr.TravelRequestId,
                        EmployeeName = tr.Employee!.UserName,
                        Source = tr.Source,
                        Destination = tr.Destination,
                        Purpose = tr.Purpose,
                        StartDate = tr.StartDate,
                        EndDate = tr.EndDate,
                        EstimatedCost = tr.EstimatedCost,
                        Status = tr.Status.ToString(),
                        CurrentStage = tr.CurrentStage.ToString(),
                        Comments = tr.Approvals
                            .OrderByDescending(a => a.ActionDate)
                            .Select(a => a.Comments)
                            .FirstOrDefault(),
                        CreatedAt = tr.CreatedAt,
                        IsDraft = tr.IsDraft
                    })
                .ToListAsync();
        }
    }
}