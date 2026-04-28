import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../services/request/request.service';
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
  allRequests: any[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.allRequests = this.requestService.getAllRequests();

    this.requests = this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.managerStatus) === 'pending',
    );
  }

  get totalRequests(): number {
    return this.allRequests.filter((req) => !req.isDraft).length;
  }

  get pendingRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.managerStatus) === 'pending',
    ).length;
  }

  get approvedRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.managerStatus) === 'approved',
    ).length;
  }

  get rejectedRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.managerStatus) === 'rejected',
    ).length;
  }

  approve(id: number) {
    this.requestService.updateManagerStatus(id, 'approved');
    this.refresh();
  }

  reject(id: number) {
    this.requestService.updateManagerStatus(id, 'rejected');
    this.refresh();
  }

  refresh() {
    this.ngOnInit();
  }

  formatStatus(status: string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'not_applicable') return 'Not Required';

    return normalized

      .split('_')

      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))

      .join(' ');
  }

  private normalizeStatus(status: string): string {
    return (status || 'pending').trim().toLowerCase();
  }

  isHighValue(req: any): boolean {
    return (Number(req.cost) || 0) >= 50000;
  }
}
