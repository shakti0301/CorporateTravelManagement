namespace TravelMgmtApi.DTOs
{
    public class CreateExpenseDto
    {
        public string Category { get; set; } = "";
        public DateOnly Date { get; set; }
        public string Description { get; set; } = "";
        public decimal Amount { get; set; }
        public string ProofPath { get; set; } = ""; 
    }
}
