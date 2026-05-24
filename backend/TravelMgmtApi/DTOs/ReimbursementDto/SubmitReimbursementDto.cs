using Microsoft.AspNetCore.Mvc;

namespace TravelMgmtApi.DTOs
{
    public class SubmitReimbursementDto
    {
        public int TravelRequestId { get; set; }
        [FromForm]
        public List<CreateExpenseDto> Expenses { get; set; } = new();
    }
}
