namespace TravelMgmtApi.Models
{
    public class Expense
    {
        public int ExpenseId { get; set; }
        public int ReimbursementId { get; set; }
        public Reimbursement? Reimbursement { get; set; }
        public string Category { get; set; } = "";
        public DateOnly Date { get; set; }
        public string Description { get; set; } = "";
        public decimal Amount { get; set; }
        public string? ProofPath { get; set; }
    }
}