import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../../services/request/request.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css',
})
export class ApprovalsComponent implements OnInit {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  role: string = '';

  requests: any[] = [];
  allRequests: any[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.role = this.currentUser?.role?.toLowerCase() || 'manager';
    this.allRequests = this.requestService.getAllRequests();

    this.requests = this.allRequests.filter((req) => {
      if (req.isDraft) return false;

      if (this.role === 'projectmanager') {
        return (
          req.pmEmail === this.currentUser.email &&
          this.normalizeStatus(req.pmStatus) === 'pending'
        );
      }

      return this.normalizeStatus(req.managerStatus) === 'pending';
    });
  }

  get totalRequests(): number {
    return this.allRequests.filter((req) => !req.isDraft).length;
  }

  get pendingRequests(): number {
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      if (this.role === 'projectmanager') {
        return (
          req.pmEmail === this.currentUser.email &&
          this.normalizeStatus(req.pmStatus) === 'pending'
        );
      }
      return this.normalizeStatus(req.managerStatus) === 'pending';
    }).length;
  }

  get approvedRequests(): number {
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      if (this.role === 'projectmanager') {
        return (
          req.pmEmail === this.currentUser.email &&
          this.normalizeStatus(req.pmStatus) === 'approved'
        );
      }
      return this.normalizeStatus(req.managerStatus) === 'approved';
    }).length;
  }

  get rejectedRequests(): number {
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      if (this.role === 'projectmanager') {
        return (
          req.pmEmail === this.currentUser.email &&
          this.normalizeStatus(req.pmStatus) === 'rejected'
        );
      }
      return this.normalizeStatus(req.managerStatus) === 'rejected';
    }).length;
  }
  approve(id: number) {
    if (this.role === 'projectmanager') {
      this.requestService.updatePMStatus(id, 'approved');
    } else {
      this.requestService.updateManagerStatus(id, 'approved');
    }
    this.refresh();
  }

  reject(id: number) {
    if (this.role === 'projectmanager') {
      this.requestService.updatePMStatus(id, 'rejected');
    } else {
      this.requestService.updateManagerStatus(id, 'rejected');
    }
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
