import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [NavbarComponent, CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css',
})
export class RequestDetailsComponent implements OnInit {
  request: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Route can be /employee/request/:id — id is the request's id or tripId
    const id = this.route.snapshot.paramMap.get('id');
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    // Match by numeric id OR by tripId string (e.g. "TRP-4823")
    this.request = requests.find(
      (r: any) => String(r.id) === String(id) || r.tripId === id,
    );
  }

  // TIMELINE STEP HELPERS
  /**
    Returns CSS class for each timeline step based on current request status.
    Steps: 'submitted' | 'manager' | 'finance'
   */
  getStepClass(step: string): string {
    if (step === 'submitted') {
      // Always done once request exists
      return 'step-done';
    }

    if (step === 'manager') {
      const status = (this.request.managerStatus || '').toLowerCase();
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      return 'step-inactive';
    }

    if (step === 'finance') {
      const status = (this.request.financeStatus || '').toLowerCase();
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      // Finance only becomes active after manager approves
      const managerDone =
        (this.request.managerStatus || '').toLowerCase() === 'approved';
      return managerDone ? 'step-inactive' : 'step-inactive';
    }

    return 'step-inactive';
  }

  /** Returns true if a step is done (approved) */
  isStepDone(step: string): boolean {
    if (step === 'submitted') return true;
    if (step === 'manager')
      return (this.request.managerStatus || '').toLowerCase() === 'approved';
    if (step === 'finance')
      return (this.request.financeStatus || '').toLowerCase() === 'approved';
    return false;
  }

  /** Returns true if a step was rejected */
  isStepRejected(step: string): boolean {
    if (step === 'manager')
      return (this.request.managerStatus || '').toLowerCase() === 'rejected';
    if (step === 'finance')
      return (this.request.financeStatus || '').toLowerCase() === 'rejected';
    return false;
  }

  /** True only when both manager AND finance have approved */
  get isFullyApproved(): boolean {
    return (
      (this.request.managerStatus || '').toLowerCase() === 'approved' &&
      (this.request.financeStatus || '').toLowerCase() === 'approved' &&
      (this.request.finalStatus || '').toLowerCase() === 'approved'
    );
  }

  // DYNAMIC INFO NOTE (bottom of actions panel)
  get statusNote(): string {
    if (!this.request) return '';

    const final = (this.request.finalStatus || '').toLowerCase();
    const manager = (this.request.managerStatus || '').toLowerCase();
    const finance = (this.request.financeStatus || '').toLowerCase();

    if (this.request.isDraft) {
      return 'This is a draft. Submit it to start the approval process.';
    }

    if (final === 'rejected' || manager === 'rejected') {
      return 'This request was rejected. See the remarks below for details.';
    }

    if (finance === 'rejected') {
      return 'Finance rejected this request. Please review and re-submit.';
    }

    if (this.isFullyApproved && this.request.expenseSubmitted) {
      return 'Expenses submitted. Awaiting finance reimbursement review.';
    }

    if (this.isFullyApproved) {
      return 'This request has been fully vetted and approved. You can now start logging expenses against this budget. Final reimbursement requires receipt submission.';
    }

    if (manager === 'approved' && finance !== 'approved') {
      return 'Manager approved. Awaiting finance department review.';
    }

    if (manager === 'pending') {
      return 'Request submitted and awaiting manager approval.';
    }

    return 'Request is under review.';
  }

  // ACTIONS
  goBack() {
    this.router.navigate(['/employee/myrequests']);
  }

  addExpense() {
    this.router.navigate([
      '/employee/expense',
      this.request.tripId || this.request.id,
    ]);
  }

  downloadPdf() {
    // Basic print-to-PDF — opens browser print dialog
    // You can replace this with a proper PDF generation library later
    window.print();
  }
}
