namespace TravelMgmtApi.DTOs
{    
    public class ReimbursementResponseDto
    {
        public int ReimbursementId { get; set; }
        public int TravelRequestId { get; set; }
        public string EmployeeName { get; set; }="";
        public string Purpose { get; set; } = "";
        public string Source { get; set; } = "";
        public string Destination { get; set; } = "";
        public decimal TotalExpense { get; set; }
        public string Status { get; set; }="";
        public string? Remarks { get; set; }
        public DateTime SubmittedAt { get; set; }
        public List<ExpenseResponseDto> Expenses { get; set; } = new();
    }
}
