import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItineraryService } from '../../../../services/itinerary/itinerary.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../services/request/request.service';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, DatePipe],
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.css',
})
export class ItineraryComponent implements OnInit {
  request: any = null;
  days: any[] = [];
  saving: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itineraryService: ItineraryService,
    private requestService: RequestService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    this.requestService.getRequestById(id).subscribe({
      next: (res: any) => {
        console.log('API response:', res);

        this.request = {
          ...res,
          id: res.travelRequestId,
          fromDate: res.startDate,
          toDate: res.endDate,
        };

        console.log('request:', this.request);

        if (this.request.itinerary?.length > 0) {
          this.days = this.request.itinerary;
        } else {
          this.days = this.itineraryService.generateDays(
            this.request.fromDate,
            this.request.toDate,
          );
        }

        console.log('days:', this.days);
      },

      error: () => {
        console.log('request not found');
      },
    });
  }
  //Activity Management

  /** Add a blank activity to a day */
  addActivity(dayIndex: any) {
    const activities = this.days[dayIndex].activities;
    const last = activities[activities.length - 1];

    if (!last.title?.trim()) {
      alert('Please fill current activity first');
      return;
    }

    activities.push(this.itineraryService.blankActivity());
  }

  /** Remove an activity from a day */
  removeActivity(dayIndex: any, activityIndex: any) {
    this.days[dayIndex].activities.splice(activityIndex, 1);
  }

  //Save Itinerary
  saveItinerary() {
    const hasActivity = this.days.some((day: any) =>
      day.activities.some((a: any) => a.title?.trim()),
    );

    if (!hasActivity) {
      alert('Add at least one activity');
      return;
    }

    this.saving = true;

    const payload = {
      travelRequestId: this.request.id,
      days: this.days,
    };

    this.itineraryService.saveItinerary(payload).subscribe({
      next: () => {
        this.saving = false;

        alert('Itinerary saved');

        this.router.navigate(['/employee/request-details', this.request.id]);
      },

      error: () => {
        this.saving = false;
        alert('Save failed');
      },
    });
  }

  //Navigation
  goBack() {
    this.router.navigate(['/employee/request-details', this.request.id]);
  }
}
