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

    // Create Travel Request

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

        if (dto.ProjectManagerId.HasValue)
        {
            firstStage =
                ApprovalStage.ProjectManager;
        }
        else
        {
            firstStage =
                ApprovalStage.Manager;
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
            Status = RequestStatus.Pending,
            CurrentStage = firstStage,
            CreatedAt = DateTime.UtcNow
        };

        _context.TravelRequests.Add(request);
        await _context.SaveChangesAsync();
        return "Travel request created successfully";
    }

    // Get My Requests

    public async Task<List<TravelRequest>> GetMyRequestsAsync(int employeeId)
    {
        return await _context.TravelRequests
            .Where(tr =>
                tr.EmployeeId == employeeId
            )
            .Include(tr => tr.Employee)
            .Include(tr => tr.ProjectManager)
            .Include(tr => tr.Manager)
            .Include(tr => tr.Finance)
            .OrderByDescending(tr => tr.CreatedAt)
            .ToListAsync();
    }
}