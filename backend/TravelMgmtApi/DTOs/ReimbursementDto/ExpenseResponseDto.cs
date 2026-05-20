namespace TravelMgmtApi.DTOs
{
    public class ExpenseResponseDto
    {
        public int ExpenseId { get; set; }
        public string Category { get; set; } = "";
        public DateOnly Date { get; set; }
        public string Description { get; set; } = "";
        public decimal Amount { get; set; }
        public string? ProofPath { get; set; }
    }
}
