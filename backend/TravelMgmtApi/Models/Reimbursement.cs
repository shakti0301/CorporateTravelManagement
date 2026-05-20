using TravelMgmtApi.Enums;

namespace TravelMgmtApi.Models
{
    public class Reimbursement
    {
        public int ReimbursementId { get; set; }
        public int TravelRequestId { get; set; }
        public TravelRequest? TravelRequest { get; set; }
        public int EmployeeId { get; set; }
        public User? Employee { get; set; }
        public bool IsSubmitted { get; set; }
        public RequestStatus Status { get; set; }
        public decimal TotalExpense { get; set; }
        public string? Remarks { get; set; }
        public DateTime SubmittedAt { get; set; }

        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}