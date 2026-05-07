import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [NavbarComponent, CommonModule, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css',
})
export class RequestDetailsComponent implements OnInit {
  request: any = null;
  showModal: boolean = false;
  selectedRequest: any = null;
  modalSubmitted: boolean = false;

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

  /** Generate a meaningful trip overview message */
  get tripOverview(): string {
    if (!this.request) return '';

    const fromDate = new Date(this.request.fromDate);
    const toDate = new Date(this.request.toDate);
    // Calculate inclusive day count (e.g. May 5 -> May 6 = 2 days).
    // Use UTC midnight to avoid timezone/DST issues when computing whole days.
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcFrom = Date.UTC(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      fromDate.getDate(),
    );
    const utcTo = Date.UTC(
      toDate.getFullYear(),
      toDate.getMonth(),
      toDate.getDate(),
    );
    let days = Math.floor((utcTo - utcFrom) / msPerDay) + 1;
    if (isNaN(days) || days < 1) days = 1;

    const overview = `Business trip from ${this.request.source || 'unknown location'} to ${this.request.destination} scheduled for ${days} day${days !== 1 ? 's' : ''} (${new Date(this.request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(this.request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}). Allocated budget: ${this.request.cost || this.request.budget || 0}.`;
    return overview;
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
    this.router.navigate(['/employee/expense', this.request.id]);
  }

  addItinerary() {
    this.router.navigate(['/employee/itinerary', this.request.id]);
  }

  downloadPdf() {
    // Basic print-to-PDF — opens browser print dialog
    window.print();
  }

  // DRAFT ACTIONS
  /**
   * Edit draft: Open the modal form for editing
   */
  openEditModal() {
    this.selectedRequest = { ...this.request };
    this.modalSubmitted = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.modalSubmitted = false;
  }

  /**
   * Save draft: Update without submitting
   */
  saveDraft(editForm: NgForm) {
    this.modalSubmitted = true;
    if (this.hasDateValidationErrors()) {
      editForm.form.markAllAsTouched();
      return;
    }
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests = requests.map((r: any) =>
      r.id === this.selectedRequest.id ||
      r.tripId === this.selectedRequest.tripId
        ? { ...this.selectedRequest, isDraft: true }
        : r,
    );
    localStorage.setItem('requests', JSON.stringify(requests));
    this.closeModal();
    this.ngOnInit();
  }

  /**
   * Submit draft with validation: Mark isDraft as false and set initial statuses
   */
  submitDraft(editForm?: NgForm) {
    this.modalSubmitted = true;
    if (editForm && (editForm.invalid || this.hasDateValidationErrors())) {
      editForm.form.markAllAsTouched();
      return;
    }
    if (!editForm && this.hasDateValidationErrors()) {
      return;
    }
    if (confirm('Submit this draft for manager approval?')) {
      const dataToSubmit = editForm ? this.selectedRequest : this.request;
      let requests = JSON.parse(localStorage.getItem('requests') || '[]');
      requests = requests.map((r: any) =>
        r.id === dataToSubmit.id || r.tripId === dataToSubmit.tripId
          ? {
              ...dataToSubmit,
              isDraft: false,
              managerStatus: 'pending',
              financeStatus: 'not_applicable',
              finalStatus: 'pending',
            }
          : r,
      );
      localStorage.setItem('requests', JSON.stringify(requests));
      if (editForm) {
        this.closeModal();
      }
      this.ngOnInit();
    }
  }

  /**
   * Delete draft: Remove it from localStorage and go back
   */
  deleteDraft() {
    if (
      confirm(
        'Are you sure you want to delete this draft? This action cannot be undone.',
      )
    ) {
      let requests = JSON.parse(localStorage.getItem('requests') || '[]');
      requests = requests.filter(
        (r: any) =>
          !(r.id === this.request.id || r.tripId === this.request.tripId),
      );
      localStorage.setItem('requests', JSON.stringify(requests));
      this.goBack();
    }
  }

  //Edit & Cancel
  canModify(req: any): boolean {
    const managerStatus = (req.managerStatus || '').toLowerCase();
    return !req.isDraft && managerStatus === 'pending';
  }

  cancelRequest(id: number) {
    const confirmDelete = confirm(
      'Are you sure you want to delete/cancel this request?',
    );
    if (!confirmDelete) return;
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests = requests.filter((r: any) => r.id !== id);
    localStorage.setItem('requests', JSON.stringify(requests));
    this.ngOnInit();
  }

  // DATE HELPERS
  get today(): string {
    return this.formatDateForInput(new Date());
  }

  get toDateMin(): string {
    const fromDate = this.selectedRequest?.fromDate;
    if (!fromDate) return this.today;
    return fromDate > this.today ? fromDate : this.today;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isPastDate(dateValue: string): boolean {
    if (!dateValue) return false;
    const selected = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }

  private hasDateValidationErrors(): boolean {
    const req = this.selectedRequest || this.request;
    return Boolean(
      this.isPastDate(req?.fromDate) ||
      this.isPastDate(req?.toDate) ||
      (req?.fromDate &&
        req?.toDate &&
        new Date(req.fromDate) > new Date(req.toDate)),
    );
  }
}
