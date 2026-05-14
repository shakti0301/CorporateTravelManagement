using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelMgmtApi.Enums;

namespace TravelMgmtApi.Models
{
    public class TravelRequestApproval
    {
        [Key]
        public int ApprovalId { get; set; }

        //Travel Request
        [ForeignKey("TravelRequest")]
        public int TravelRequestId {get; set;}
        public TravelRequest? TravelRequest { get; set; }

        //Approver (User)
        [ForeignKey("Approver")]
        public int ApproverId { get; set; }
        public User? Approver { get; set; }

        //Status
        public RequestStatus Status { get; set; }
        [MaxLength(500)]
        public string? Comments { get; set; }
        public ApprovalStage ApprovalStage { get; set; }
        public DateTime ActionDate { get; set; } = DateTime.UtcNow;
    }
}