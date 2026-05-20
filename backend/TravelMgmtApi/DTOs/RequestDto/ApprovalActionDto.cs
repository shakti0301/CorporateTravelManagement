using System.ComponentModel.DataAnnotations;
using TravelMgmtApi.Enums;

namespace TravelMgmtApi.DTOs
{
    public class ApprovalActionDto
    {
        [Required]
        public int TravelRequestId { get; set; }

        [Required]
        public RequestStatus Status { get; set; }
        [MaxLength(500)]
        public string? Comments { get; set; }
    }
}