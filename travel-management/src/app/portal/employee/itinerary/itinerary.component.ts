import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [],
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.css',
})
export class ItineraryComponent implements OnInit {
  requestId: any;
  currentRequest: any = null;

  constructor(private route: ActivatedRoute) {
    // Get id from route parameter
    this.requestId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.loadCurrentRequest();
  }

  loadCurrentRequest() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    // Match by numeric id OR by tripId string (e.g. "TRP-4823")
    this.currentRequest = requests.find(
      (r: any) =>
        String(r.id) === String(this.requestId) || r.tripId === this.requestId,
    );

    if (!this.currentRequest) {
      alert('Travel request not found!');
      return;
    }
  }
}
