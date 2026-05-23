namespace TravelMgmtApi.DTOs;

public class TravelRequestResponseDto
{
    public int TravelRequestId { get; set; }
    public string EmployeeName { get; set; } = "";
    public string Source { get; set; } = "";
    public string Destination { get; set; } = "";
    public string Purpose { get; set; } = "";
    public decimal EstimatedCost { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "";
    public string PmStatus { get; set; } = "not_applicable";
    public string ManagerStatus { get; set; } = "not_applicable";
    public string FinanceStatus { get; set; } = "not_applicable";
    public string? PmEmail { get; set; }
    public string CurrentStage { get; set; } = "";
    public bool IsDraft { get; set; }
    public string? Comments { get; set; }
    // Latest rejection comment and who made it (if any)
    public string? RejectionComment { get; set; }
    public string? RejectionByEmail { get; set; }
    public string? RejectionByName { get; set; }
    public string? RejectionStage { get; set; }
    public DateTime CreatedAt { get; set; }
}