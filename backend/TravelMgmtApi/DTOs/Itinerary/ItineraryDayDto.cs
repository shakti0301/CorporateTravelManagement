namespace TravelMgmtApi.DTOs
{
    public class ItineraryDayDto
    {
        public int DayNumber { get; set; }
        public DateTime Date { get; set; }
        public string? Label { get; set; }
        public List<ActivityDto> Activities { get; set; } = new();
    }
}