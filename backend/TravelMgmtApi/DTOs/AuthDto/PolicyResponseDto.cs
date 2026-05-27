namespace TravelMgmtApi.DTOs
{
    public class PolicyResponseDto
    {
        public int TravelPolicyId { get; set; }

        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = "";

        public decimal MaxBudget { get; set; }
    }
}