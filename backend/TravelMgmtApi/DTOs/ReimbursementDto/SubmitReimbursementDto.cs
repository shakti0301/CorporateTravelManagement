namespace TravelMgmtApi.DTOs
{
    public class SubmitReimbursementDto
    {
        public int TravelRequestId { get; set; }
        public List<CreateExpenseDto> Expenses { get; set; } = new();
    }
}
