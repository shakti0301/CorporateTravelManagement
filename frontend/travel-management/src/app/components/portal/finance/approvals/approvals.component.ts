import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css',
})
export class ApprovalsComponent implements OnInit {
  allRequests: any[] = [];
  activeTab: 'pending' | 'approve' | 'reject' = 'pending';

  // Inline reject
  rejectingId: number | null = null;
  rejectReason: string = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.allRequests = this.requestService.getAllRequests();
  }

  // Tab lists
  get pendingList(): any[] {
    return this.allRequests.filter(
      (req) =>
        !req.isDraft &&
        this.normalize(req.managerStatus) === 'approved' &&
        this.normalize(req.financeStatus) === 'pending',
    );
  }

  get approveList(): any[] {
    return this.allRequests.filter(
      (req) => !req.isDraft && this.normalize(req.financeStatus) === 'approved',
    );
  }

  // Reject = out of policy (cost > 50000) and still pending
  get rejectList(): any[] {
    return this.pendingList.filter((req) => Number(req.cost || 0) > 50000);
  }

  get activeList(): any[] {
    const map = {
      pending: this.pendingList,
      approve: this.approveList,
      reject: this.rejectList,
    };
    return map[this.activeTab];
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.activeList.length / this.pageSize) || 1;
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

  setTab(tab: 'pending' | 'approve' | 'reject') {
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
    this.requestService.updateFinanceStatus(id, 'approved');
    this.load();
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
      alert('Please provide a reason for rejection.');
      return;
    }
    this.requestService.updateFinanceStatus(id, 'rejected', this.rejectReason);
    this.cancelReject();
    this.load();
  }

  // Helpers
  getInitials(email: string): string {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  getAvatarColor(email: string): string {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return colors[hash % colors.length];
  }

  normalize(status: string): string {
    return (status || '').trim().toLowerCase();
  }
}
