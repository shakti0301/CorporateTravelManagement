import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    MatTooltipModule,
  ],
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
  /** Check if request is submitted to a Project Manager */
  get hasPM(): boolean {
    return (
      this.request &&
      this.request.pmEmail &&
      this.request.pmEmail.trim() !== '' &&
      (this.request.pmStatus || 'not_applicable').toLowerCase() !==
        'not_applicable'
    );
  }

  /**
    Returns CSS class for each timeline step based on current request status.
    Steps: 'submitted' | 'pm' | 'manager' | 'finance' (depends on hasPM)
   */
  getStepClass(step: string): string {
    if (step === 'submitted') {
      // Always done once request exists
      return 'step-done';
    }

    if (step === 'pm') {
      const status = (this.request.pmStatus || '').toLowerCase();
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      if (status === 'pending') return 'step-inactive';
      return 'step-inactive';
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
    if (step === 'pm')
      return (this.request.pmStatus || '').toLowerCase() === 'approved';
    if (step === 'manager')
      return (this.request.managerStatus || '').toLowerCase() === 'approved';
    if (step === 'finance')
      return (this.request.financeStatus || '').toLowerCase() === 'approved';
    return false;
  }

  /** Returns true if a step was rejected */
  isStepRejected(step: string): boolean {
    if (step === 'pm')
      return (this.request.pmStatus || '').toLowerCase() === 'rejected';
    if (step === 'manager')
      return (this.request.managerStatus || '').toLowerCase() === 'rejected';
    if (step === 'finance')
      return (this.request.financeStatus || '').toLowerCase() === 'rejected';
    return false;
  }

  /** True only when all required approvals have been granted */
  get isFullyApproved(): boolean {
    const managerApproved =
      (this.request.managerStatus || '').toLowerCase() === 'approved';
    const financeApproved =
      (this.request.financeStatus || '').toLowerCase() === 'approved';
    const finalApproved =
      (this.request.finalStatus || '').toLowerCase() === 'approved';

    // If PM exists, PM must also approve
    if (this.hasPM) {
      const pmApproved =
        (this.request.pmStatus || '').toLowerCase() === 'approved';
      return pmApproved && managerApproved && financeApproved && finalApproved;
    }

    // Without PM, just need manager and finance
    return managerApproved && financeApproved && finalApproved;
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

    const overview = `Business trip from ${this.request.source || 'unknown location'} to ${this.request.destination} scheduled for ${days} day${days !== 1 ? 's' : ''} (${new Date(this.request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(this.request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}). Allocated budget: ${this.request.cost || this.request.budget || 0}, Total Expenses: ${this.request.expenses || 'Not submitted yet'}.`;
    return overview;
  }

  //Employee can able to add expences only after trip is start (fromDate)
  get canAddExpenses(): boolean {
    if (!this.request) return false;
    const today = new Date();
    const fromDate = new Date(this.request.fromDate);
    return today >= fromDate;
  }

  // DYNAMIC INFO NOTE (bottom of actions panel)
  get statusNote(): string {
    if (!this.request) return '';

    const final = (this.request.finalStatus || '').toLowerCase();
    const pm = (this.request.pmStatus || '').toLowerCase();
    const manager = (this.request.managerStatus || '').toLowerCase();
    const finance = (this.request.financeStatus || '').toLowerCase();

    if (this.request.isDraft) {
      return 'This is a draft. Submit it to start the approval process.';
    }

    // Check for rejections
    if (final === 'rejected' || pm === 'rejected') {
      return 'This request was rejected by Project Manager. See the remarks below for details.';
    }

    if (manager === 'rejected') {
      return 'This request was rejected by Manager. See the remarks below for details.';
    }

    if (finance === 'rejected') {
      return 'Finance rejected this request. Please review and re-submit.';
    }

    // Fully approved states
    if (this.isFullyApproved && this.request.expenseSubmitted) {
      return 'Expenses submitted. Awaiting finance reimbursement review.';
    }

    if (this.isFullyApproved) {
      return 'This request has been fully vetted and approved. You can now start logging expenses against this budget. Final reimbursement requires receipt submission.';
    }

    // In-progress states
    if (this.hasPM) {
      if (pm === 'pending') {
        return 'Request submitted and awaiting Project Manager approval.';
      }
      if (pm === 'approved' && manager === 'pending') {
        return 'Project Manager approved. Awaiting Manager review.';
      }
      if (
        pm === 'approved' &&
        manager === 'approved' &&
        finance !== 'approved'
      ) {
        return 'Manager approved. Awaiting finance department review.';
      }
    } else {
      if (manager === 'pending') {
        return 'Request submitted and awaiting manager approval.';
      }
      if (manager === 'approved' && finance !== 'approved') {
        return 'Manager approved. Awaiting finance department review.';
      }
    }

    return 'Request is under review.';
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  goBack() {
    this.router.navigate([this.basePath + '/myrequests']);
  }

  addExpense() {
    this.router.navigate([this.basePath + '/expense', this.request.id]);
  }

  openItinerary() {
    this.router.navigate([this.basePath + '/itinerary', this.request.id]);
  }

  addItinerary() {
    this.router.navigate([this.basePath + '/itinerary', this.request.id]);
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
    this.show = true;
  }

  show = false;
  showCancelModal = false;
  showExpenseModal = false;

  get basePath(): string {
    const role = localStorage.getItem('role') || '';
    if (role.toLowerCase() === 'projectmanager') return '/pm';
    if (role.toLowerCase() === 'manager') return '/manager';
    return '/employee';
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
    // Check if request has a Project Manager assigned
    const hasPM = req.pmEmail && req.pmEmail.trim() !== '';
    const pmApproved = (req.pmStatus || '').toLowerCase() === 'approved';

    // If PM exists and PM has approved, employee CANNOT edit/cancel
    if (hasPM && pmApproved) {
      return false;
    } else if (hasPM) {
      // If PM exists but hasn't approved, employee CAN edit/cancel
      return true;
    }

    // Otherwise, original logic: can modify if not draft and manager status is pending
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

  //Itinerary
  editItinerary() {
    this.router.navigate([this.basePath + '/itinerary', this.request.id]);
  }

  // Returns true only for index 0 (used in template)
  isFirst(index: number): boolean {
    return index === 0;
  }

  // Returns different icon background color per day position
  getDayIconClass(day: any): string {
    const n = day.dayNumber;
    if (n === 1) return 'icon-blue'; // first day — plane
    if (n === this.request.itinerary.length) return 'icon-green'; // last day
    return 'icon-indigo'; // middle days
  }
}
