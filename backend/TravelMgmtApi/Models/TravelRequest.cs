using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelMgmtApi.Enums;

namespace TravelMgmtApi.Models
{
    public class TravelRequest
    {
        [Key]
        public int TravelRequestId { get; set; }

        //Employee who made the request
        [ForeignKey("Employee")]
        public int EmployeeId { get; set; }
        public User? Employee { get; set; }

        //Project Manager (optional)
        [ForeignKey("ProjectManager")]
        public int? ProjectManagerId { get; set; }
        public User? ProjectManager { get; set; }

        //Department Manager
        [ForeignKey("Manager")]
        public int ManagerId { get; set; }
        public User? Manager { get; set; }

        //Finance Person
        [ForeignKey("Finance")]
        public int FinanceId { get; set; }
        public User? Finance { get; set; }

        //Travel details
        [Required]
        [MaxLength(200)]
        public string Source { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string Destination { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [Required]
        [MaxLength(500)]
        public string Purpose { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public bool IsDraft { get; set; } = false;

        //Status 
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public ApprovalStage CurrentStage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //Approval history
        public ICollection<TravelRequestApproval> Approvals { get; set; } = new List<TravelRequestApproval>();

    }
}