import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';
import { RequestService } from '../../../../services/request/request.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  allRequests: any[] = [];
  pendingTravel: any[] = [];
  activeTab: 'reimburse' | 'travel' = 'reimburse';

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(
    private reimbursementService: ReimbursementService,
    private router: Router,
    private requestService: RequestService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    // reimbursement section only
    this.allRequests = this.reimbursementService.getAllRequests();

    // travel approval section only
    this.requestService.getFinanceRequests().subscribe({
      next: (res: any) => {
        const mapped = (res || []).map((r: any) => ({
          ...r,
          id: r.travelRequestId,
          userEmail: r.employeeName,
          fromDate: r.startDate,
          toDate: r.endDate,
          cost: r.estimatedCost,
        }));

        this.pendingTravel = mapped.filter(
          (x: any) => x.currentStage === 'Finance',
        );
      },

      error: (err) => {
        console.log(err);
        this.pendingTravel = [];
      },
    });
  }

  // Stats
  get pendingCount(): number {
    return this.allRequests.filter(
      (r) => this.normalize(r.reimbursementStatus) === 'pending',
    ).length;
  }

  get approvedThisMonth(): number {
    const now = new Date();
    return this.allRequests.filter((r) => {
      if (this.normalize(r.reimbursementStatus) !== 'approved') return false;
      const d = new Date(r.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  get totalReimbursed(): number {
    return this.allRequests
      .filter((r) => this.normalize(r.reimbursementStatus) === 'approved')
      .reduce((sum, r) => sum + this.getTotal(r), 0);
  }

  get rejectedCount(): number {
    return this.allRequests.filter(
      (r) => this.normalize(r.reimbursementStatus) === 'rejected',
    ).length;
  }

  // Queue table — all requests, with search
  get filteredList(): any[] {
    // return list depending on active tab
    if (this.activeTab === 'reimburse') return this.allRequests;
    return this.pendingTravel;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.pageSize) || 1;
  }

  get paginatedList(): any[] {
    // We want to show only the most recent 5 entries for the dashboard queue
    const list = this.filteredList.slice();
    // try to sort by createdAt desc when possible
    list.sort((a: any, b: any) => {
      const da = new Date(a.createdAt || a.createdAtUtc || 0).getTime();
      const db = new Date(b.createdAt || b.createdAtUtc || 0).getTime();
      return db - da;
    });
    return list.slice(0, 5);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingText(): string {
    const total = this.filteredList.length;
    if (total === 0) return 'No entries';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total} entries`;
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

  goToReimbursements() {
    this.router.navigate(['/finance/reimbursement']);
  }

  goToApprovals() {
    this.router.navigate(['/finance/approval']);
  }

  // Helpers
  getTotal(req: any): number {
    if (!req.expenses) return Number(req.totalExpense || 0);
    return req.expenses.reduce(
      (s: number, e: any) => s + Number(e.amount || 0),
      0,
    );
  }

  getInitials(email: string): string {
    return email ? email.substring(0, 2).toUpperCase() : '?';
  }

  getAvatarColor(email: string): string {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return colors[hash % colors.length];
  }

  getStatusClass(status: string): string {
    const s = this.normalize(status);
    if (s === 'approved') return 'status-approved';
    if (s === 'rejected') return 'status-rejected';
    return 'status-pending';
  }

  normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }
}
