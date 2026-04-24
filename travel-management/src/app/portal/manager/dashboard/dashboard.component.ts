import { Component, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  requests: any[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    const allRequests = this.requestService.getAllRequests();
    this.requests = allRequests.filter(
      (req: any) => req.managerStatus === 'pending',
    );
  }

  approve(id: number) {
    this.requestService.updateManagerStatus(id, 'approved');
    this.loadRequests();
  }

  reject(id: number) {
    this.requestService.updateManagerStatus(id, 'rejected');
    this.loadRequests();
  }
}
