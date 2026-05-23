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

  get basePath(): string {
    const role = localStorage.getItem('role') || '';
    if (role.toLowerCase() === 'projectmanager') return '/pm';
    if (role.toLowerCase() === 'manager') return '/manager';
    return '/employee';
  }

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
        this.request = {
          ...res,
          id: res.travelRequestId,
          fromDate: res.startDate,
          toDate: res.endDate,
        };

        if (this.request.itinerary && this.request.itinerary.length > 0) {
          this.days = this.request.itinerary;
        } else {
          this.days = this.itineraryService.generateDays(
            this.request.fromDate,
            this.request.toDate,
          );
        }
      },
      error: () => {
        console.log('request not found');
      },
    });
  }

  //Activity Management

  /** Add a blank activity to a day */
  addActivity(dayIndex: any) {
    this.days[dayIndex].activities.push(this.itineraryService.blankActivity());
  }

  /** Remove an activity from a day */
  removeActivity(dayIndex: any, activityIndex: any) {
    this.days[dayIndex].activities.splice(activityIndex, 1);
  }

  //Save Itinerary
  saveItinerary() {
    this.saving = true;

    const payload = {
      travelRequestId: this.request.id,
      days: this.days,
    };

    this.itineraryService.saveItinerary(payload).subscribe({
      next: () => {
        this.saving = false;
        alert('Itinerary saved');
        this.router.navigate([
          this.basePath + '/request-details',
          this.request.id,
        ]);
      },
      error: () => {
        this.saving = false;
        alert('Save failed');
      },
    });
  }

  //Navigation
  goBack() {
    this.router.navigate([this.basePath + '/request-details', this.request.id]);
  }
}
