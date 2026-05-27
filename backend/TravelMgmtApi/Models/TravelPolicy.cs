namespace TravelMgmtApi.Models
{
    public class TravelPolicy
    {
       public int TravelPolicyId { get; set; }

        public int DepartmentId { get; set; }

        public decimal MaxBudget { get; set; }

        public Department? Department { get; set; }
    }
}