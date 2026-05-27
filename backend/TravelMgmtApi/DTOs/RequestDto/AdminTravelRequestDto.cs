namespace TravelMgmtApi.DTOs
{
    public class AdminTravelRequestDto
    {
        public int TravelRequestId { get; set; }
        public string EmployeeName { get; set; } = "";
        public string EmployeeEmail { get; set; } = "";
        public string UserRole { get; set; } = "";
        public string Department { get; set; } = "";
        public string Source { get; set; } = "";
        public string Destination { get; set; } = "";
        public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = "";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}