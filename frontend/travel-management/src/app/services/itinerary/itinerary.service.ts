import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ItineraryService {
  constructor(private http: HttpClient) {}

  //Generate Days
  generateDays(fromDate: string, toDate: string): any[] {
    const days = [];

    const start = new Date(fromDate);
    const end = new Date(toDate);

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
  saveItinerary(data: any) {
    return this.http.post(
      environment.apiUrl + '/TravelRequest/itinerary',
      data,
    );
  }

  getItinerary(request: any): any[] {
    return request?.itinerary || [];
  }

  hasItinerary(request: any): boolean {
    return request?.itinerary?.some((day: any) =>
      day.activities?.some((a: any) => a.title?.trim()),
    );
  }
}
