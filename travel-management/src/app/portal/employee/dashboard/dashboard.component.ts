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

  get totalRequests(): number {
    return this.requests.length;
  }

  get approvedRequests(): number {
    return this.requests.filter(
      (req) => this.normalizeStatus(req.finalStatus) === 'approved',
    ).length;
  }

  get pendingRequests(): number {
    return this.requests.filter(
      (req) => this.normalizeStatus(req.finalStatus) === 'pending',
    ).length;
  }

  formatStatus(status: string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'not_applicable') {
      return 'Not Required';
    }

    return normalized
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private normalizeStatus(status: string): string {
    return (status || 'pending').trim().toLowerCase();
  }
}
