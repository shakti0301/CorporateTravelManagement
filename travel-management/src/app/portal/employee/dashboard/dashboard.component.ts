import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../services/request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  requests: any[] = [];

  constructor(private requestService: RequestService) {}
  ngOnInit() {
    this.requests = this.requestService.getRequestsByUser();
  }
}
