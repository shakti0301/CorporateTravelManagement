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
      this.requestService.getPendingPMRequests().subscribe({
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
              r.currentStage === 'ProjectManager'
                ? 'pending'
                : r.status.toLowerCase(),
            managerStatus: r.currentStage === 'Manager' ? 'pending' : '',
            financeStatus: r.currentStage === 'Finance' ? 'pending' : '',
          }));
        },
      });
    } else {
      this.requestService.getPendingManagerRequests().subscribe({
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
              r.currentStage === 'Manager' ? 'pending' : r.status.toLowerCase(),
            financeStatus: r.currentStage === 'Finance' ? 'pending' : '',
          }));
        },
      });
    }
  }

  // Filter by role scope
  private scopedRequests(): any[] {
    return this.allRequests.filter((req) => {
      if (req.isDraft) return false;
      if (this.role === 'projectmanager') {
        return req.pmEmail === this.currentUser.email;
      }
      return true;
    });
  }

  private getStatus(req: any): string {
    if (this.role === 'projectmanager') return this.normalize(req.pmStatus);
    return this.normalize(req.managerStatus);
  }

  get pendingList(): any[] {
    return this.scopedRequests().filter((r) => this.getStatus(r) === 'pending');
  }

  get approvedList(): any[] {
    return this.scopedRequests().filter(
      (r) => this.getStatus(r) === 'approved',
    );
  }

  get rejectedList(): any[] {
    return this.scopedRequests().filter(
      (r) => this.getStatus(r) === 'rejected',
    );
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
    const request = this.allRequests.find((r) => r.id === id);

    if (!request) return;

    if (this.role === 'projectmanager') {
      this.requestService.updatePMStatus(id, 'approved').subscribe(() => {
        this.loadRequests();
      });
    } else {
      this.requestService.updateManagerStatus(id, 'approved').subscribe(() => {
        this.loadRequests();
      });
    }
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
      alert('Please provide a reason');
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

    apiCall.subscribe(() => {
      this.cancelReject();
      this.loadRequests();
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
    return (status || 'pending').trim().toLowerCase();
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
