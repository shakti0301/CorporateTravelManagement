import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css',
})
export class ApprovalsComponent implements OnInit {
  requests: any[] = [];

  allRequests: any[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.allRequests = this.requestService.getAllRequests();

    // only manager approved + finance pending

    this.requests = this.allRequests.filter(
      (req) =>
        !req.isDraft &&
        this.normalizeStatus(req.managerStatus) === 'approved' &&
        this.normalizeStatus(req.financeStatus) === 'pending',
    );
  }

  get totalRequests(): number {
    return this.allRequests.filter((req) => !req.isDraft).length;
  }

  get pendingRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft &&
        this.normalizeStatus(req.managerStatus) === 'approved' &&
        this.normalizeStatus(req.financeStatus) === 'pending',
    ).length;
  }

  get approvedRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.financeStatus) === 'approved',
    ).length;
  }

  get rejectedRequests(): number {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft && this.normalizeStatus(req.financeStatus) === 'rejected',
    ).length;
  }

  get pendingAmount(): number {
    return this.requests
      .filter(
        (req) =>
          !req.isDraft &&
          this.normalizeStatus(req.managerStatus) === 'approved' &&
          this.normalizeStatus(req.financeStatus) === 'pending',
      )
      .reduce((sum, req) => sum + (Number(req.cost) || 0), 0);
  }

  get averagePendingAmount(): number {
    const pending = this.requests.filter(
      (req) =>
        !req.isDraft &&
        this.normalizeStatus(req.managerStatus) === 'approved' &&
        this.normalizeStatus(req.financeStatus) === 'pending',
    );

    if (!pending.length) return 0;

    const total = pending.reduce(
      (sum, req) => sum + (Number(req.cost) || 0),
      0,
    );

    return Math.round(total / pending.length);
  }

  approve(id: number) {
    this.requestService.updateFinanceStatus(id, 'approved');

    this.refresh();
  }

  reject(id: number) {
    this.requestService.updateFinanceStatus(id, 'rejected');

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
