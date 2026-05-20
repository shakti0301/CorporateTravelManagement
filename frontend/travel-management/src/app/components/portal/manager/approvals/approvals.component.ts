import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../services/request/request.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css',
})
export class ApprovalsComponent implements OnInit {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  role: string = '';
  allRequests: any[] = [];

  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  // Inline reject box
  rejectingId: number | null = null;
  rejectReason: string = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.role = this.currentUser?.role?.toLowerCase() || 'manager';
    this.loadRequests();
  }
  loadRequests() {
    if (this.role === 'projectmanager') {
      this.requestService.getPMRequests().subscribe({
        next: (res: any) => {
          this.allRequests = res.map((r: any) => ({
            ...r,
            id: r.travelRequestId,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,
            reason: r.comments || '',

            pmStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'ProjectManager'
                  ? 'pending'
                  : 'approved',

            managerStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'Manager'
                  ? 'pending'
                  : r.currentStage === 'Finance' ||
                      r.currentStage === 'Completed'
                    ? 'approved'
                    : '',

            financeStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'Finance'
                  ? 'pending'
                  : r.currentStage === 'Completed'
                    ? 'approved'
                    : '',
          }));
        },
      });
    } else {
      this.requestService.getManagerRequests().subscribe({
        next: (res: any) => {
          this.allRequests = res.map((r: any) => ({
            ...r,
            id: r.travelRequestId,
            userEmail: r.employeeName,
            fromDate: r.startDate,
            toDate: r.endDate,
            cost: r.estimatedCost,
            reason: r.comments || '',

            managerStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'Manager'
                  ? 'pending'
                  : r.currentStage === 'Finance' ||
                      r.currentStage === 'Completed'
                    ? 'approved'
                    : '',

            financeStatus:
              r.status === 'Rejected'
                ? 'rejected'
                : r.currentStage === 'Finance'
                  ? 'pending'
                  : r.currentStage === 'Completed'
                    ? 'approved'
                    : '',
          }));
        },
      });
    }
  }

  // Filter by role scope
  private scopedRequests(): any[] {
    return this.allRequests.filter((req) => {
      return !req.isDraft;
    });
  }

  private getStatus(req: any): string {
    if (this.role === 'projectmanager') {
      if (req.pmStatus) {
        return this.normalize(req.pmStatus);
      }
    }
    if (this.role === 'manager') {
      if (req.managerStatus) {
        return this.normalize(req.managerStatus);
      }
    }

    return '';
  }

  private isRejectedForCurrentRole(req: any): boolean {
    const stage = this.normalize(req.currentStage);

    if (this.role === 'projectmanager') {
      return stage === 'projectmanager';
    }

    if (this.role === 'manager') {
      return stage === 'manager';
    }

    return false;
  }
  get approvedList(): any[] {
    return this.scopedRequests().filter((r) => {
      return this.getStatus(r) === 'approved';
    });
  }

  get rejectedList(): any[] {
    return this.scopedRequests().filter((r) => {
      return (
        this.getStatus(r) === 'rejected' && this.isRejectedForCurrentRole(r)
      );
    });
  }

  get pendingList(): any[] {
    return this.scopedRequests().filter((r) => {
      return this.getStatus(r) === 'pending';
    });
  }

  get activeList(): any[] {
    const map = {
      pending: this.pendingList,
      approved: this.approvedList,
      rejected: this.rejectedList,
    };
    return map[this.activeTab];
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.activeList.length / this.pageSize);
  }

  get paginatedList(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.activeList.slice(start, start + this.pageSize);
  }

  get showingText(): string {
    const total = this.activeList.length;
    if (total === 0) return 'No entries';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total} entries`;
  }

  setTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.cancelReject();
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // Actions
  approve(id: number) {
    const apiCall =
      this.role === 'projectmanager'
        ? this.requestService.updatePMStatus(id, 'approved')
        : this.requestService.updateManagerStatus(id, 'approved');

    apiCall.subscribe({
      next: () => {
        // reset UI state
        this.currentPage = 1;

        this.loadRequests();
        this.activeTab = 'pending';
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  openReject(id: number) {
    this.rejectingId = id;
    this.rejectReason = '';
  }

  cancelReject() {
    this.rejectingId = null;
    this.rejectReason = '';
  }

  confirmReject(id: number) {
    if (!this.rejectReason.trim()) {
      alert('Please provide reason');
      return;
    }
    const apiCall =
      this.role === 'projectmanager'
        ? this.requestService.updatePMStatus(id, 'rejected', this.rejectReason)
        : this.requestService.updateManagerStatus(
            id,
            'rejected',
            this.rejectReason,
          );

    apiCall.subscribe({
      next: () => {
        this.cancelReject();
        this.currentPage = 1;
        this.loadRequests();
        this.activeTab = 'pending';
      },
    });
  }

  approveAll() {
    if (!confirm(`Approve all ${this.pendingList.length} pending requests?`))
      return;
    this.pendingList.forEach((req) => this.approve(req.id));
  }

  // Helpers
  getInitials(email: string): string {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  getAvatarColor(email: string): string {
    const colors = [
      '#4f46e5',
      '#0891b2',
      '#059669',
      '#d97706',
      '#dc2626',
      '#7c3aed',
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return colors[hash % colors.length];
  }

  normalize(status: string): string {
    return (status || '').trim().toLowerCase();
  }

  get pageTitle(): string {
    return this.role === 'projectmanager' ? 'PM Approvals' : 'Team Approvals';
  }

  get pageSubtitle(): string {
    return this.role === 'projectmanager'
      ? 'Review requests assigned to you before they move to Manager.'
      : 'Review and manage travel requests from your team.';
  }
}
