using System.Linq;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Enums;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Services;

public class TravelRequestService : ITravelRequestService
{
    private readonly ITravelRequestRepository _travelRepository;
    private readonly IAuthRepository _authRepository;

    public TravelRequestService(ITravelRequestRepository travelRepository, IAuthRepository authRepository)
    {
        _travelRepository = travelRepository;
        _authRepository = authRepository;
    }

    // Create Travel Request

    public async Task<string> CreateRequestAsync(int employeeId,CreateTravelRequestDto dto)
    {
        var employee =
            await _travelRepository
            .GetEmployeeByIdAsync(employeeId);

        if(employee == null)
        {
            return "Employee not found";
        }

        if(!dto.IsDraft && employee.DepartmentId.HasValue && dto.EstimatedCost.HasValue)
        {
            var policy = await _authRepository.GetPolicyByDepartmentAsync(employee.DepartmentId.Value);

            if(policy != null && dto.EstimatedCost.Value > policy.MaxBudget)
            {
                return $"Budget exceeded. Department limit is ₹{policy.MaxBudget}";
            }
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

        var request = new TravelRequest
        {
            EmployeeId = employeeId,
            ProjectManagerId = dto.ProjectManagerId,
            ManagerId = manager.UserId,
            FinanceId = finance.UserId,

            Source = dto.Source ?? "",
            Destination = dto.Destination ?? "",
            Purpose = dto.Purpose ?? "",

            StartDate = dto.StartDate,
            EndDate = dto.EndDate,

            EstimatedCost = dto.EstimatedCost ?? 0,

            IsDraft = dto.IsDraft,

            Status = dto.IsDraft
                ? RequestStatus.Draft
                : RequestStatus.Pending,

            CurrentStage = dto.IsDraft
                ? ApprovalStage.Completed
                : firstStage,

            CreatedAt = DateTime.UtcNow
        };

        await _travelRepository.AddRequestAsync(request);
        await _travelRepository.SaveChangesAsync();

        return "Travel request created successfully";
    }

    //Update Draft
    public async Task<string> UpdateDraftAsync(int id, CreateTravelRequestDto dto)
    {
        var request = await _travelRepository.GetRequestByIdAsync(id);
        if(request == null)
            return "Request not found";

        // only draft OR not PM approved

        // Draft always editable
        if (!request.IsDraft)
        {
            var pmApproved = request.Approvals.Any(a =>
                a.ApprovalStage == ApprovalStage.ProjectManager &&
                a.Status == RequestStatus.Approved
            );

            var managerApproved = request.Approvals.Any(a =>
                a.ApprovalStage == ApprovalStage.Manager &&
                a.Status == RequestStatus.Approved
            );

            // If PM exists -> lock after PM approval
            if (request.ProjectManagerId.HasValue && pmApproved)
            {
                return "Request cannot be edited";
            }

            // If no PM -> lock after manager approval
            if (!request.ProjectManagerId.HasValue && managerApproved)
            {
                return "Request cannot be edited";
            }
        }

        request.Source= dto.Source ?? request.Source;
        request.Destination=dto.Destination ?? request.Destination;
        request.Purpose=dto.Purpose ?? request.Purpose;
        request.StartDate=dto.StartDate;
        request.EndDate=dto.EndDate;
        request.EstimatedCost=dto.EstimatedCost ?? request.EstimatedCost;
        await _travelRepository.SaveChangesAsync();
        return "Updated successfully";
    }
    
    // Submit Draft
    public async Task<string> SubmitDraftAsync(int id)
    {
        var request = await _travelRepository.GetRequestByIdAsync(id);

        if(request == null)
            return "Request not found";

        request.IsDraft = false;
        request.Status = RequestStatus.Pending;
        var roleName = request.Employee?.Role?.Name;

Console.WriteLine("ROLE = " + roleName);
Console.WriteLine("EMPLOYEE ID = " + request.EmployeeId);
        var userRole = request.Employee?.Role?.Name?
                            .Trim()
                            .ToLower();

        // PM flow:
        // PM → Manager → Finance
        if(userRole == "projectmanager")
        {
            request.CurrentStage = ApprovalStage.Manager;
        }

        // Manager flow:
        // Manager → Finance
        else if(userRole == "manager")
        {
            request.CurrentStage = ApprovalStage.Finance;
        }

        // Employee flow:
        // Employee → PM(optional) → Manager
        else
        {
            if(request.ProjectManagerId.HasValue)
            {
                request.CurrentStage =
                    ApprovalStage.ProjectManager;
            }
            else
            {
                request.CurrentStage =
                    ApprovalStage.Manager;
            }
        }

        await _travelRepository.SaveChangesAsync();
        Console.WriteLine(request.Employee?.Role?.Name);

        return "Draft submitted";
    }

   
    // Delete Draft
    public async Task<string> DeleteRequestAsync(int id)
    {
        var request = await _travelRepository.GetRequestByIdAsync(id);

        if(request==null)
            return "Request not found";

        if(!request.IsDraft)
        {
            return "Only draft can be deleted";
        }
        await _travelRepository.DeleteAsync(request);
        return "Draft deleted";
    }

    // Cancel Request
    public async Task<string> CancelRequestAsync(int id)
    {
        var request = await _travelRepository.GetRequestByIdAsync(id);

        if(request==null)
            return "Request not found";

        var pmApproved = request.Approvals.Any(a =>
            a.ApprovalStage == ApprovalStage.ProjectManager &&
            a.Status == RequestStatus.Approved
        );

        var managerApproved = request.Approvals.Any(a =>
            a.ApprovalStage == ApprovalStage.Manager &&
            a.Status == RequestStatus.Approved
        );

        if(pmApproved || managerApproved)
        {
            return "Cannot cancel after approval";
        }

        await _travelRepository.DeleteAsync(request);

        return "Request deleted";
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

            // find latest rejection comment (if any)
            var lastRejected = tr.Approvals
                .OrderByDescending(a => a.ActionDate)
                .FirstOrDefault(a => a.Status == RequestStatus.Rejected && !string.IsNullOrWhiteSpace(a.Comments));

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
                IsDraft = tr.IsDraft,
                PmEmail = tr.ProjectManager?.Email,
                CurrentStage = tr.CurrentStage.ToString(),
                CreatedAt = tr.CreatedAt,
                Itinerary = tr.ItineraryDays
                    .OrderBy(x => x.DayNumber)
                    .Select(day => new ItineraryDayDto
                    {
                        DayNumber = day.DayNumber,
                        Date = day.Date,
                        Label = day.Label,
                        
                        Activities = day.Activities.Select(a => new ActivityDto
                        {
                            Title = a.Title,
                            Time = a.Time,
                            Location = a.Location,
                            Description = a.Description
                        }).ToList()
                    })
                    .ToList(),
                // Manager name for display in UI timeline
                Comments = tr.Approvals
                    .OrderByDescending(a => a.ActionDate)
                    .Select(a => a.Comments)
                    .FirstOrDefault(),
                // Manager display name
                // (added to DTO as RejectionByName if needed elsewhere)
                RejectionComment = lastRejected?.Comments,
                RejectionByEmail = lastRejected?.Approver?.Email,
                RejectionByName = lastRejected?.Approver?.UserName,
                RejectionStage = lastRejected?.ApprovalStage.ToString(),
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

    public async Task<List<AdminTravelRequestDto>> GetAllRequestsForAdminAsync()
    {
        return await _travelRepository.GetAllRequestsForAdminAsync();
    }

    public async Task<string> SaveItineraryAsync(CreateItineraryDto dto)
    {
        var request = await _travelRepository.GetRequestByIdAsync(dto.TravelRequestId);

        if(request == null)
        {
            return "Travel request not found";
        }

        await _travelRepository.DeleteExistingItineraryAsync(dto.TravelRequestId);

        var days = dto.Days.Select(day => new ItineraryDay
        {
            TravelRequestId = dto.TravelRequestId,
            DayNumber = day.DayNumber,
            Date = day.Date,
            Label = day.Label,
            Activities = day.Activities.Select(a => new Activity
                {
                    Title=a.Title,
                    Time=a.Time,
                    Location=a.Location,
                    Description=a.Description
                }
            ).ToList()
        })
        .ToList();

        await _travelRepository.SaveItineraryAsync(days);
        await _travelRepository.SaveChangesAsync();
        return "Itinerary saved successfully";
    }
}