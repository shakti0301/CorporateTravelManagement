using TravelMgmtApi.DTOs;
using TravelMgmtApi.Enums;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Services;

public class TravelRequestService : ITravelRequestService
{
    private readonly ITravelRequestRepository _travelRepository;

    public TravelRequestService(
        ITravelRequestRepository travelRepository
    )
    {
        _travelRepository = travelRepository;
    }

    // Create Travel Request

    public async Task<string> CreateRequestAsync(
        int employeeId,
        CreateTravelRequestDto dto
    )
    {
        var employee =
            await _travelRepository
            .GetEmployeeByIdAsync(employeeId);

        if(employee == null)
        {
            return "Employee not found";
        }

        if(!dto.IsDraft)
        {
            if(
                string.IsNullOrWhiteSpace(dto.Source)
                || string.IsNullOrWhiteSpace(dto.Destination)
                || string.IsNullOrWhiteSpace(dto.Purpose)
                || !dto.StartDate.HasValue
                || !dto.EndDate.HasValue
                || !dto.EstimatedCost.HasValue
                || dto.EstimatedCost <= 0
            )
            {
                return "Please fill all required fields";
            }
        }

        if(employee.Department?.ManagerId == null)
        {
            return "Department manager not assigned";
        }
        var manager = await _travelRepository.GetManagerAsync(employee.Department.ManagerId.Value);
        
        if(manager == null)
        {
            return "Department manager not found";
        }

        var finance = await _travelRepository.GetFinanceAsync();

        if(finance == null)
        {
            return "Finance user not found";
        }

        ApprovalStage firstStage;

        if(employee.Role?.Name=="Manager")
        {
            firstStage = ApprovalStage.Finance;
        }

        else if(employee.Role?.Name=="ProjectManager")
        {
            firstStage = ApprovalStage.Manager;
        }

        else if(dto.ProjectManagerId.HasValue)
        {
            firstStage = ApprovalStage.ProjectManager;
        }

        else
        {
            firstStage = ApprovalStage.Manager;
        }

        var request =
            new TravelRequest
            {
                EmployeeId=employeeId,
                ProjectManagerId=dto.ProjectManagerId,
                ManagerId=manager.UserId,
                FinanceId=finance.UserId,

                Source=dto.Source ?? "",
                Destination=dto.Destination ?? "",
                Purpose=dto.Purpose ?? "",

                StartDate=dto.StartDate,
                EndDate=dto.EndDate,

                EstimatedCost=
                    dto.EstimatedCost ?? 0,

                IsDraft=dto.IsDraft,

                Status=RequestStatus.Pending,

                CurrentStage=firstStage,

                CreatedAt=DateTime.UtcNow
            };

        await _travelRepository.AddRequestAsync(request);
        await _travelRepository.SaveChangesAsync();

        return "Travel request created successfully";
    }


    // Get Methods

    public async Task<List<TravelRequestResponseDto>>GetMyRequestsAsync(int employeeId)
    {
        return await _travelRepository.GetMyRequestsAsync(employeeId);
    }


    public async Task<List<TravelRequestResponseDto>>GetDraftRequestsAsync(int employeeId)
    {
        return await _travelRepository.GetDraftRequestsAsync(employeeId);
    }

    public async Task<TravelRequestResponseDto?> GetByIdAsync(int requestId)
    {
        var tr = await _travelRepository.GetRequestByIdAsync(requestId);

        if(tr == null)
        {
            return null;
        }

        return new TravelRequestResponseDto
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
            CreatedAt = tr.CreatedAt
        };
    }


    public async Task<List<TravelRequestResponseDto>>GetManagerRequestsAsync(int managerId)
    {
        return await _travelRepository.GetManagerRequestsAsync(managerId);
    }


    public async Task<List<TravelRequestResponseDto>>GetPMRequestsAsync(int pmId)
    {
        return await _travelRepository.GetPMRequestsAsync(pmId);
    }

    public async Task<List<TravelRequestResponseDto>>GetFinanceRequestsAsync(int financeId)
    {
        return await _travelRepository.GetFinanceRequestsAsync(financeId);
    }

    public async Task<List<TravelRequestResponseDto>>GetPendingPMRequestsAsync(int projectManagerId)
    {
        return await _travelRepository.GetPendingPMRequestsAsync(projectManagerId);
    }

    public async Task<List<TravelRequestResponseDto>>GetPendingManagerRequestsAsync(int managerId)
    {
        return await _travelRepository.GetPendingManagerRequestsAsync(managerId);
    }

    public async Task<List<TravelRequestResponseDto>>GetPendingFinanceRequestsAsync(int financeId)
    {
        return await _travelRepository.GetPendingFinanceRequestsAsync(financeId);
    }


    // Approve Reject

    public async Task<string>ApproveOrRejectAsync(int approverId,ApprovalActionDto dto)
    {
        var request = await _travelRepository.GetRequestByIdAsync(dto.TravelRequestId);

        if(request==null)
        {
            return "Request not found";
        }


        var approval =
            new TravelRequestApproval
            {
                TravelRequestId = request.TravelRequestId,
                ApproverId = approverId,
                Status = dto.Status,
                Comments = dto.Comments,
                ApprovalStage = request.CurrentStage
            };

        await _travelRepository.AddApprovalAsync(approval);

        if(dto.Status == RequestStatus.Rejected)
        {
            request.Status = RequestStatus.Rejected;
        }

        else if(dto.Status == RequestStatus.Approved)
        {
            request.Status = RequestStatus.Pending;

            if(request.CurrentStage == ApprovalStage.ProjectManager)
            {
                request.CurrentStage = ApprovalStage.Manager;
            }

            else if(request.CurrentStage == ApprovalStage.Manager)
            {
                request.CurrentStage = ApprovalStage.Finance;
            }

            else if(request.CurrentStage == ApprovalStage.Finance)
            {
                request.Status = RequestStatus.Approved;
                request.CurrentStage = ApprovalStage.Completed;
            }
        }

        else
        {
            return "Request remains pending";
        }

        await _travelRepository.SaveChangesAsync();
        return "Action completed";
    }
}