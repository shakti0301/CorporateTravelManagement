namespace TravelMgmtApi.Models
{
    public class ItineraryDay
    {
        public int ItineraryDayId { get; set; }

        public int TravelRequestId { get; set; }
        public TravelRequest? TravelRequest { get; set; }

        public int DayNumber { get; set; }

        public DateTime Date { get; set; }

        public string? Label { get; set; }

        public ICollection<Activity> Activities { get; set; }
            = new List<Activity>();
    }
}