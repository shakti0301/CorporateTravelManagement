import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

@Component({
  selector: 'app-reimbursements',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './reimbursements.component.html',
  styleUrl: './reimbursements.component.css',
})
export class ReimbursementsComponent implements OnInit {
  allRequests: any[] = [];
  selectedRequest: any = null;
  showModal = false;
  rejectRemark = '';

  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(private reimbursementService: ReimbursementService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.reimbursementService.getFinanceRequests().subscribe({
      next: (res: any) => {
        this.allRequests = (res || []).map((r: any) => ({
          ...r,
          id: r.reimbursementId,
          userEmail: r.employeeName,
          destination: r.destination,
          purpose: r.purpose,
          totalExpense: r.totalExpense,
          reimbursementStatus: r.status,
          reimbursementRemark: r.remarks,
          createdAt: r.submittedAt,
          expenses: r.expenses || [],
        }));
      },

      error: (err) => {
        console.log(err);
        this.allRequests = [];
      },
    });
  }

  // Tab lists
  get pendingList(): any[] {
    return this.allRequests.filter(
      (r) => this.normalize(r.reimbursementStatus) === 'pending',
    );
  }

  get approvedList(): any[] {
    return this.allRequests.filter(
      (r) => this.normalize(r.reimbursementStatus) === 'approved',
    );
  }

  get rejectedList(): any[] {
    return this.allRequests.filter(
      (r) => this.normalize(r.reimbursementStatus) === 'rejected',
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

  setTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.activeList.length / this.pageSize) || 1;
  }

  get paginatedList(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.activeList.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingText(): string {
    const total = this.activeList.length;
    if (total === 0) return 'No results';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total} results`;
  }

  goToPage(p: number) {
    this.currentPage = p;
  }
  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // Modal
  openDetails(req: any) {
    this.selectedRequest = req;
    this.rejectRemark = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.rejectRemark = '';
  }

  approveRequest() {
    this.reimbursementService.approve(this.selectedRequest.id).subscribe({
      next: () => {
        this.closeModal();
        this.load();
      },
    });
  }

  rejectRequest() {
    if (!this.rejectRemark.trim()) {
      alert('Please provide reason');
      return;
    }

    this.reimbursementService
      .reject(this.selectedRequest.id, this.rejectRemark)
      .subscribe({
        next: () => {
          this.closeModal();
          this.load();
        },
      });
  }

  // Helpers
  getTotalExpense(req: any): number {
    if (!req.expenses) return Number(req.totalExpense || 0);
    return req.expenses.reduce(
      (sum: number, e: any) => sum + Number(e.amount || 0),
      0,
    );
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      Food: '🍽️',
      Meals: '🍽️',
      Travel: '✈️',
      Airfare: '✈️',
      Accommodation: '🛏️',
      Lodging: '🛏️',
      Transport: '🚗',
      Other: '📦',
    };
    return icons[category] || '📋';
  }

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

  normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }
}
