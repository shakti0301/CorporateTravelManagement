using Microsoft.EntityFrameworkCore;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Enums;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Services;

public class TravelRequestService : ITravelRequestService
{
    private readonly AppDbContext _context;

    public TravelRequestService(
        AppDbContext context
    )
    {
        _context = context;
    }

    // Create Travel Requestq
    public async Task<string> CreateRequestAsync(
        int employeeId,
        CreateTravelRequestDto dto
    )
    {
        // Find employee
        var employee = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(
                u => u.UserId == employeeId
            );

        if (employee == null)
        {
            return "Employee not found";
        }

        // Find department manager
        var manager = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.UserId ==
                employee.Department!.ManagerId
            );

        if (manager == null)
        {
            return "Department manager not found";
        }

        // Find finance user
        var finance = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Role!.Name == "Finance"
            );

        if (finance == null)
        {
            return "Finance user not found";
        }

        // Decide first stage
        ApprovalStage firstStage;
        if (dto.ProjectManagerId.HasValue && dto.ProjectManagerId > 0)
        {
            firstStage = ApprovalStage.ProjectManager;
        }
        else
        {
            firstStage = ApprovalStage.Manager;
            dto.ProjectManagerId = null;
        }

        // Create request
        var request = new TravelRequest
        {
            EmployeeId = employeeId,
            ProjectManagerId = dto.ProjectManagerId,
            ManagerId = manager.UserId,
            FinanceId = finance.UserId,
            Source = dto.Source,
            Destination = dto.Destination,
            Purpose = dto.Purpose,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            EstimatedCost = dto.EstimatedCost,
            IsDraft = dto.IsDraft,
            Status = RequestStatus.Pending,
            CurrentStage = firstStage,
            CreatedAt = DateTime.UtcNow
        };

        _context.TravelRequests.Add(request);
        await _context.SaveChangesAsync();
        return "Travel request created successfully";
    }

    // Get My Requests
    public async Task<List<TravelRequestResponseDto>> GetMyRequestsAsync(int employeeId)
    {
        return await _context.TravelRequests
            .Where( tr => tr.EmployeeId == employeeId)
            .Include(tr => tr.Employee)
            .OrderByDescending(tr => tr.CreatedAt)
            .Select( tr => new TravelRequestResponseDto
            {
                TravelRequestId = tr.TravelRequestId,
                EmployeeName = tr.Employee!.UserName,
                Source = tr.Source,
                Destination = tr.Destination,
                Purpose = tr.Purpose,
                EstimatedCost = tr.EstimatedCost,
                Status = tr.Status.ToString(),
                CurrentStage = tr.CurrentStage.ToString(),
                CreatedAt = tr.CreatedAt
            })
            .ToListAsync();
    }

    // Pending Manager Requests
    public async Task<List<TravelRequestResponseDto>> GetPendingManagerRequestsAsync(int managerId)
    {
        return await _context.TravelRequests
            .Include(tr => tr.Employee)
            .Where(tr =>
                tr.ManagerId == managerId &&
                tr.CurrentStage == ApprovalStage.Manager &&
                tr.Status == RequestStatus.Pending
            )

            .Select(tr =>
                new TravelRequestResponseDto
                {
                    TravelRequestId = tr.TravelRequestId,
                    EmployeeName = tr.Employee!.UserName,
                    Source = tr.Source,
                    Destination = tr.Destination,
                    Purpose = tr.Purpose,
                    EstimatedCost = tr.EstimatedCost,
                    Status = tr.Status.ToString(),
                    CurrentStage = tr.CurrentStage.ToString(),
                    CreatedAt =tr.CreatedAt
                })

            .ToListAsync();
    }
    public async Task<string>ApproveOrRejectAsync(int approverId,ApprovalActionDto dto)
    {
        var request =
            await _context.TravelRequests
            .FirstOrDefaultAsync(
                x =>
                x.TravelRequestId == dto.TravelRequestId
            );

        if(request==null)
        {
            return "Request not found";
        }

        // Save approval history

        var approval =
            new TravelRequestApproval
            {
                TravelRequestId = request.TravelRequestId,
                ApproverId = approverId,
                Status =dto.Status,
                Comments = dto.Comments,
                ApprovalStage = request.CurrentStage
            };

        _context.TravelRequestApprovals.Add(approval);

        // Rejected
        if(dto.Status == RequestStatus.Rejected)
        {
            request.Status = RequestStatus.Rejected;
        }

        // Approved
        else if(dto.Status == RequestStatus.Approved)
        {
            if(request.CurrentStage == ApprovalStage.Manager)
            {
                request.CurrentStage = ApprovalStage.Finance;
            }

            else if(request.CurrentStage == ApprovalStage.Finance)
            {
                request.Status = RequestStatus.Approved;
                request.CurrentStage = ApprovalStage.Completed;
            }
        }

        // Pending → do nothing
        else
        {
            return "Request remains pending";
        }

        await _context.SaveChangesAsync();
        return "Action completed";
    }
        
    public async Task<List<TravelRequestResponseDto>>GetPendingFinanceRequestsAsync(int financeId)
    {
        return await _context.TravelRequests
            .Include(tr => tr.Employee)
            .Where(tr => 
                tr.FinanceId == financeId &&
                tr.CurrentStage == ApprovalStage.Finance &&
                tr.Status == RequestStatus.Pending
            )
            .Select(tr => new TravelRequestResponseDto
            {
                TravelRequestId = tr.TravelRequestId,
                EmployeeName = tr.Employee!.UserName,
                Source = tr.Source,
                Destination = tr.Destination,
                Purpose = tr.Purpose,
                EstimatedCost = tr.EstimatedCost,
                Status = tr.Status.ToString(),
                CurrentStage = tr.CurrentStage.ToString(),
                CreatedAt = tr.CreatedAt
            })
            .ToListAsync();
    }
}