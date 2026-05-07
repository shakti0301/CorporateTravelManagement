import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ItineraryService {
  constructor() {}

  //Get Single Request
  getRequestById(id: any) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    return requests.find((r: any) => r.id === id);
  }

  //Generate Days
  generateDays(fromDate: string, toDate: string) {
    const days = [];

    const start = new Date(fromDate);

    const end = new Date(toDate);
    let current = new Date(start);

    let dayNumber = 1;

    while (current <= end) {
      days.push({
        dayNumber: dayNumber,
        date: new Date(current),

        activities: [
          {
            title: '',
            time: '',
            location: '',
            description: '',
          },
        ],
      });

      current.setDate(current.getDate() + 1);
      dayNumber++;
    }
    return days;
  }

  // SAVE ITINERARY

  saveItinerary(requestId: any, itineraryDays: any[]) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id == requestId) {
        return {
          ...r,
          itinerary: itineraryDays,
        };
      }
      return r;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
  }
}
