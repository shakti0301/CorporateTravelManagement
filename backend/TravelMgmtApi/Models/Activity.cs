namespace TravelMgmtApi.Models
{
    public class Activity
    {
        public int ActivityId { get; set; }

        public int ItineraryDayId { get; set; }
        public ItineraryDay? ItineraryDay { get; set; }

        public string Title { get; set; } = "";

        public string Time { get; set; } = "";

        public string Location { get; set; } = "";

        public string Description { get; set; } = "";
    }
}