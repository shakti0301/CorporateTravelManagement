namespace TravelMgmtApi.DTOs;

public class TravelRequestResponseDto
{
    public int TravelRequestId { get; set; }
    public string EmployeeName { get; set; } = "";
    public string Source { get; set; } = "";
    public string Destination { get; set; } = "";
    public string Purpose { get; set; } = "";
    public decimal EstimatedCost { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "";
    public string CurrentStage { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}