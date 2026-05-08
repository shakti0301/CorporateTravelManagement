import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ItineraryService {
  constructor() {}

  //Get Single Request
  getRequestById(id: any) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    return requests.find((r: any) => r.id == id || r.tripId == id);
  }

  //Generate Days
  generateDays(fromDate: string, toDate: string): any[] {
    const days = [];
    const start = new Date(fromDate + 'T00:00:00');
    const end = new Date(toDate + 'T00:00:00');
    let current = new Date(start);
    let dayNumber = 1;

    while (current <= end) {
      days.push({
        dayNumber,
        date: current.toISOString(),
        label: '',
        activities: [this.blankActivity()],
      });

      current = new Date(current);
      current.setDate(current.getDate() + 1);
      dayNumber++;
    }
    return days;
  }

  // Blank Activity
  // Used when adding a new activity to a day
  blankActivity() {
    return {
      title: '',
      time: '',
      location: '',
      description: '',
    };
  }

  // SAVE ITINERARY
  saveItinerary(requestId: any, itineraryDays: any[]) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id == requestId) {
        return {
          ...r,
          itinerary: itineraryDays,
          itineraryUpdatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
  }

  // GET ITINERARY (for reading in other components e.g. request-details)
  getItinerary(requestId: any): any[] {
    const request = this.getRequestById(requestId);
    return request?.itinerary || [];
  }

  // HAS ITINERARY (to show/hide Itinerary tab or badge)
  hasItinerary(requestId: any): boolean {
    const itinerary = this.getItinerary(requestId);
    // Returns true only if at least one activity has a title filled
    return itinerary.some((day: any) =>
      day.activities?.some((a: any) => a.title?.trim()),
    );
  }
}
