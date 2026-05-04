import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RequestService } from '../../../services/request/request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  requests: any[] = [];
  currentYear = new Date().getFullYear();

  constructor(
    private requestService: RequestService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.requests = this.requestService.getRequestsByUser();
  }

  // STAT GETTERS

  get totalRequests(): number {
    return this.requests.length;
  }

  get pendingApproval(): number {
    return this.requests.filter(
      (r) => (r.managerStatus || '').toLowerCase() === 'pending',
    ).length;
  }

  get approvedTrips(): number {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'approved',
    ).length;
  }

  get rejectedRequests(): number {
    return this.requests.filter(
      (r) =>
        (r.finalStatus || '').toLowerCase() === 'rejected' ||
        (r.finalStatus || '').toLowerCase() === 'draft',
    ).length;
  }

  get totalReimbursed(): number {
    return this.requests.reduce(
      (sum, r) =>
        r.reimbursementStatus === 'approved'
          ? sum + Number(r.totalExpense || 0)
          : sum,
      0,
    );
  }

  get pendingReimbursements(): number {
    return this.requests.filter(
      (r) => r.expenseSubmitted && r.reimbursementStatus === 'pending',
    ).length;
  }

  // RECENT REQUESTS (last 5, newest first)

  get recentRequests(): any[] {
    return [...this.requests]
      .sort((a, b) => {
        // Sort by creation date or fromDate descending
        const dateA = new Date(a.createdAt || a.fromDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.fromDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }

  // STATUS HELPERS (for table badges)

  getStatusClass(req: any): string {
    // Completed = finance approved the reimbursement
    if (
      req.reimbursementStatus === 'approved' ||
      (req.finalStatus || '').toLowerCase() === 'completed'
    ) {
      return 'badge-completed';
    }

    const final = (req.finalStatus || '').toLowerCase();
    const manager = (req.managerStatus || '').toLowerCase();
    const finance = (req.financeStatus || '').toLowerCase();

    const reimbursementStatus = (req.reimbursementStatus || '').toLowerCase();

    if (reimbursementStatus === 'approved') {
      return 'badge-approved';
    }

    if (reimbursementStatus === 'rejected') {
      return 'badge-rejected';
    }

    if (reimbursementStatus === 'pending') {
      return 'badge-pending';
    }

    if (final === 'approved') {
      return 'badge-approved';
    }

    if (final === 'rejected') return 'badge-rejected';

    if (manager === 'pending') return 'badge-pending';

    if (finance === 'pending') return 'badge-pending';

    return 'badge-draft';
  }

  getStatusLabel(req: any): string {
    if (req.isDraft) return 'Draft';

    if (req.reimbursementStatus === 'approved') return 'Completed';
    if (req.reimbursementStatus === 'rejected') return 'Rejected';
    if (req.reimbursementStatus === 'pending') return 'Reimbursement Pending';

    if (req.expenseSubmitted) return 'Expense Submitted';

    if ((req.finalStatus || '').toLowerCase() === 'approved') return 'Approved';
    if ((req.finalStatus || '').toLowerCase() === 'rejected') return 'Rejected';

    return 'Pending Approval';
  }

  // TRIP GETTERS

  get currentTrips(): any[] {
    const today = new Date();
    return this.requests.filter((r) => {
      if ((r.finalStatus || '').toLowerCase() !== 'approved') return false;
      const from = new Date(r.fromDate);
      const to = new Date(r.toDate);
      return today >= from && today <= to;
    });
  }

  get upcomingTrips(): any[] {
    const today = new Date();
    return this.requests
      .filter((r) => {
        if ((r.finalStatus || '').toLowerCase() !== 'approved') return false;
        return new Date(r.fromDate) > today;
      })
      .sort(
        (a, b) =>
          new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime(),
      );
  }

  // COMPLETED LOGIC
  // A trip is "Completed" when finance has approved the reimbursement
  // (reimbursementStatus === 'approved') OR finalStatus === 'completed'

  isTripCompleted(trip: any): boolean {
    return (
      trip.reimbursementStatus === 'approved' ||
      (trip.finalStatus || '').toLowerCase() === 'completed'
    );
  }

  // TRIP PROGRESS HELPERS

  getTripDuration(trip: any): number {
    const from = new Date(trip.fromDate);
    const to = new Date(trip.toDate);
    const days = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days + 1; // inclusive
  }

  getTripDay(trip: any): number {
    const from = new Date(trip.fromDate);
    const today = new Date();

    const startOfFrom = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
    );
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const days = Math.floor(
      (startOfToday.getTime() - startOfFrom.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, days + 1);
  }

  getTripProgress(trip: any): number {
    const day = this.getTripDay(trip);
    const duration = this.getTripDuration(trip);
    return Math.min(100, Math.round((day / duration) * 100));
  }

  getDaysUntil(trip: any): number {
    const from = new Date(trip.fromDate);
    const today = new Date();
    return Math.ceil(
      (from.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  // NAVIGATION

  createRequest() {
    this.router.navigate(['/employee/request']);
  }

  viewAllRequests() {
    this.router.navigate(['/employee/myrequests']);
  }

  viewTripDetails(trip: any) {
    this.router.navigate(['/employee/myrequests', trip.id]);
  }
}
