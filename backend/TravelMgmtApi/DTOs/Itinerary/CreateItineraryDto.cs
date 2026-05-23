using TravelMgmtApi.Models;

namespace TravelMgmtApi.DTOs
{
    public class CreateItineraryDto
    {
        public int TravelRequestId { get; set; }
        public List<ItineraryDayDto> Days { get; set; } = new();
    }
}