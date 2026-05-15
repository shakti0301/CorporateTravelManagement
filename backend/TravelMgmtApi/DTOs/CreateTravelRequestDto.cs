using System.ComponentModel.DataAnnotations;

namespace TravelMgmtApi.DTOs
{
    public class CreateTravelRequestDto
    {
        //Optional PM
        public int? ProjectManagerId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Source { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string Destination { get; set; } = string.Empty;
        [Required]
        [MaxLength(500)]
        public string Purpose { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal EstimatedCost { get; set; }
        public bool IsDraft { get; set; }
    }
}