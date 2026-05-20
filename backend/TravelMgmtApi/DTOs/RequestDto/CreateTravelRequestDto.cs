using System.ComponentModel.DataAnnotations;

namespace TravelMgmtApi.DTOs
{
   public class CreateTravelRequestDto
    {
        public int? ProjectManagerId { get; set; }

        public string? Source { get; set; }

        public string? Destination { get; set; }

        public string? Purpose { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? EstimatedCost { get; set; }

        public bool IsDraft { get; set; }
    }
}