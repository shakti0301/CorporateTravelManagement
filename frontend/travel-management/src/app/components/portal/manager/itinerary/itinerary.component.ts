import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItineraryService } from '../../../../services/itinerary/itinerary.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  ) {}

  ngOnInit() {
    //Get request id from route
    const id = this.route.snapshot.paramMap.get('id');

    //Get request details
    this.request = this.itineraryService.getRequestById(id);
    if (!this.request) return;

    //If itinerary exists, load it. Otherwise generate days shells from the request dates
    if (this.request.itinerary && this.request.itinerary.length > 0) {
      this.days = this.request.itinerary;
    } else {
      this.days = this.itineraryService.generateDays(
        this.request.fromDate,
        this.request.toDate,
      );
    }
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

    setTimeout(() => {
      this.itineraryService.saveItinerary(this.request.id, this.days);
      this.saving = false;
      alert('Itinerary saved successfully!');

      //Navigate back to request details
      this.router.navigate([this.basePath + '/request-details', this.request.id]);
    });
  }

  //Navigation
  goBack() {
    this.router.navigate([this.basePath + '/request-details', this.request.id]);
  }
}
