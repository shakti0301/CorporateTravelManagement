import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RequestService } from '../../../../services/request/request.service';
import { Router } from '@angular/router';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

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
    private reimbursementService: ReimbursementService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getMyRequests().subscribe({
      next: (travelRes: any) => {
        this.reimbursementService.getMyReimbursements().subscribe({
          next: (reimbRes: any) => {
            const reimbursementMap = new Map();

            (reimbRes || []).forEach((r: any) => {
              reimbursementMap.set(r.travelRequestId, r);
            });

            this.requests = travelRes.map((r: any) => {
              const reimbursement = reimbursementMap.get(r.travelRequestId);

              return {
                ...r,

                id: r.travelRequestId,
                fromDate: r.startDate,
                toDate: r.endDate,

                finalStatus: r.status,

                reimbursementStatus: reimbursement?.status || null,

                totalExpense: reimbursement?.totalExpense || 0,

                expenseSubmitted: !!reimbursement,

                reimbursementRemark: reimbursement?.remarks || '',

                managerStatus: r.currentStage === 'Manager' ? 'pending' : '',

                financeStatus: r.currentStage === 'Finance' ? 'pending' : '',
              };
            });
          },
        });
      },
    });
  }
  // STAT GETTERS

  get totalRequests(): number {
    return this.requests.length;
  }

  get thisMonthRequests(): number {
    const now = new Date();
    return this.requests.filter((r) => {
      const created = new Date(r.createdAt || r.fromDate);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  get pendingApproval(): number {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'pending',
    ).length;
  }

  get approvedTrips(): number {
    return this.requests.filter(
      (r) => r.finalStatus?.toLowerCase() === 'approved' && !r.expenseSubmitted,
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

  getExpenseCostLabel(req: any): string {
    const totalExpense = Number(req?.totalExpense);

    if ((req.finalStatus || '').toLowerCase() === 'rejected') {
      return 'Request rejected';
    }

    if (
      !req?.expenseSubmitted ||
      !Number.isFinite(totalExpense) ||
      totalExpense <= 0
    ) {
      return 'Not submitted';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalExpense);
  }

  // STATUS HELPERS (for table badges)

  getStatusClass(req: any): string {
    const final = (req.finalStatus || '').toLowerCase();

    const reimb = (req.reimbursementStatus || '').toLowerCase();

    if (final === 'rejected') {
      return 'badge-rejected';
    }

    if (final !== 'approved') {
      return 'badge-pending';
    }

    if (!req.expenseSubmitted) {
      return 'badge-approved';
    }

    if (reimb === 'pending') {
      return 'badge-pending';
    }

    if (reimb === 'approved') {
      return 'badge-completed';
    }

    if (reimb === 'rejected') {
      return 'badge-rejected';
    }

    return 'badge-approved';
  }

  getStatusLabel(req: any) {
    const final = (req.finalStatus || '').toLowerCase();

    const reimb = (req.reimbursementStatus || '').toLowerCase();

    // Travel request rejected
    if (final === 'rejected') {
      return 'Travel Request Rejected';
    }

    // Travel still under approval flow
    if (final !== 'approved') {
      return 'Pending Approval';
    }

    // Approved → expense phase
    if (!req.expenseSubmitted) {
      return 'Ready for Expenses';
    }

    // Reimbursement flow
    if (reimb === 'pending') {
      return 'Reimbursement Pending';
    }

    if (reimb === 'approved') {
      return 'Trip Completed';
    }

    if (reimb === 'rejected') {
      return 'Reimbursement Rejected';
    }

    return 'Approved';
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
      (trip.reimbursementStatus || '').toLowerCase() === 'approved' ||
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
    this.router.navigate(['/employee/request-details', trip.id]);
  }
}
