import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { RequestService } from '../../../../services/request/request.service';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

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
    private requestService: RequestService,
    private reimbursementService: ReimbursementService,
  ) {}

  loadRequest(id: any) {
    this.requestService.getRequestById(id).subscribe({
      next: (res: any) => {
        this.reimbursementService.getMyReimbursements().subscribe({
          next: (reimbursements: any) => {
            const reimbursement = (reimbursements || []).find(
              (item: any) =>
                Number(item.travelRequestId) === Number(res.travelRequestId),
            );

            this.request = this.normalizeRequest(res, reimbursement);
            console.log(this.request);
          },
          error: () => {
            this.request = this.normalizeRequest(res);
          },
        });
      },

      error: (err) => {
        console.log(err);
        alert('Request not found');
      },
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadRequest(id);
  }

  private normalizeStatus(status: string): string {
    return (status || '').trim().toLowerCase();
  }

  private normalizeStage(stage: string): string {
    return (stage || '').trim().toLowerCase();
  }

  private deriveStatusFlow(
    status: string,
    currentStage: string,
    hasPM: boolean,
  ) {
    const normalizedStatus = this.normalizeStatus(status);
    const normalizedStage = this.normalizeStage(currentStage);

    const flow = {
      pmStatus: hasPM ? 'pending' : 'not_applicable',
      managerStatus: 'not_applicable',
      financeStatus: 'not_applicable',
    };

    // DRAFT
    if (normalizedStatus === 'draft') {
      return {
        pmStatus: 'not_applicable',
        managerStatus: 'not_applicable',
        financeStatus: 'not_applicable',
      };
    }

    // FULLY APPROVED
    if (normalizedStatus === 'approved') {
      return {
        pmStatus: hasPM ? 'approved' : 'not_applicable',
        managerStatus: 'approved',
        financeStatus: 'approved',
      };
    }

    // REJECTED
    if (normalizedStatus === 'rejected') {
      if (normalizedStage === 'projectmanager') {
        flow.pmStatus = 'rejected';
      } else if (normalizedStage === 'manager') {
        if (hasPM) {
          flow.pmStatus = 'approved';
        }

        flow.managerStatus = 'rejected';
      } else if (normalizedStage === 'finance') {
        if (hasPM) {
          flow.pmStatus = 'approved';
        }

        flow.managerStatus = 'approved';
        flow.financeStatus = 'rejected';
      }

      return flow;
    }

    // PENDING STAGES

    if (normalizedStage === 'projectmanager') {
      flow.pmStatus = 'pending';
    } else if (normalizedStage === 'manager') {
      if (hasPM) {
        flow.pmStatus = 'approved';
      }

      flow.managerStatus = 'pending';
    } else if (normalizedStage === 'finance') {
      if (hasPM) {
        flow.pmStatus = 'approved';
      }

      flow.managerStatus = 'approved';
      flow.financeStatus = 'pending';
    }

    return flow;
  }

  private normalizeRequest(res: any, reimbursement: any = null) {
    const currentStage = this.normalizeStage(res.currentStage);
    const finalStatus = this.normalizeStatus(res.status);
    const reimbursementStatus = this.normalizeStatus(reimbursement?.status);
    return {
      ...res,
      id: res.travelRequestId,
      fromDate: res.startDate,
      toDate: res.endDate,
      cost: res.estimatedCost,

      isDraft: res.isDraft,

      totalExpense: reimbursement?.totalExpense || 0,
      finalStatus,
      currentStage,

      expenseSubmitted: !!reimbursement,
      reimbursementStatus,

      reimbursementRemark: reimbursement?.remarks || '',

      ...this.deriveStatusFlow(finalStatus, currentStage, !!res.pmEmail),
    };
  }

  // TIMELINE STEP HELPERS
  /** Check if request is submitted to a Project Manager */
  get hasPM(): boolean {
    return this.request?.pmStatus !== 'not_applicable';
  }
  /**
    Returns CSS class for each timeline step based on current request status.
    Steps: 'submitted' | 'pm' | 'manager' | 'finance' (depends on hasPM)
   */
  getStepClass(step: string): string {
    if (step === 'submitted') {
      if (this.request?.isDraft) {
        return 'step-inactive';
      }
      return 'step-done';
    }

    if (step === 'pm') {
      const status = this.normalizeStatus(this.request.pmStatus);
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      if (status === 'pending') return 'step-inactive';
      return 'step-inactive';
    }

    if (step === 'manager') {
      const status = this.normalizeStatus(this.request.managerStatus);
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      return 'step-inactive';
    }

    if (step === 'finance') {
      const status = this.normalizeStatus(this.request.financeStatus);
      if (status === 'approved') return 'step-done';
      if (status === 'rejected') return 'step-rejected';
      // Finance only becomes active after manager approves
      const managerDone =
        this.normalizeStatus(this.request.managerStatus) === 'approved';
      return managerDone ? 'step-inactive' : 'step-inactive';
    }

    return 'step-inactive';
  }

  /** Returns true if a step is done (approved) */
  isStepDone(step: string): boolean {
    if (step === 'submitted') return true;
    if (step === 'pm')
      return this.normalizeStatus(this.request.pmStatus) === 'approved';
    if (step === 'manager')
      return this.normalizeStatus(this.request.managerStatus) === 'approved';
    if (step === 'finance')
      return this.normalizeStatus(this.request.financeStatus) === 'approved';
    return false;
  }

  /** Returns true if a step was rejected */
  isStepRejected(step: string): boolean {
    if (step === 'pm')
      return this.normalizeStatus(this.request.pmStatus) === 'rejected';
    if (step === 'manager')
      return this.normalizeStatus(this.request.managerStatus) === 'rejected';
    if (step === 'finance')
      return this.normalizeStatus(this.request.financeStatus) === 'rejected';
    return false;
  }

  /** True only when all required approvals have been granted */
  get isFullyApproved(): boolean {
    const managerApproved =
      this.normalizeStatus(this.request.managerStatus) === 'approved';
    const financeApproved =
      this.normalizeStatus(this.request.financeStatus) === 'approved';
    const finalApproved =
      this.normalizeStatus(this.request.finalStatus) === 'approved';

    // If PM exists, PM must also approve
    if (this.hasPM) {
      const pmApproved =
        this.normalizeStatus(this.request.pmStatus) === 'approved';
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

    const overview = `Business trip from ${this.request.source || 'unknown location'} to ${this.request.destination} scheduled for ${days} day${days !== 1 ? 's' : ''} (${new Date(this.request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(this.request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}). Allocated budget: ${'₹'}${this.request.cost || this.request.budget || 0}, Total Expenses: ${'₹'}${this.request.totalExpense || 'Not submitted yet'}.`;
    return overview;
  }

  //Employee can able to add expences only after trip is start (fromDate)
  get canAddExpenses(): boolean {
    if (!this.request) return false;
    const today = new Date();
    const fromDate = new Date(this.request.fromDate);
    return today >= fromDate;
  }

  getExpenseActionLabel(): string {
    const status = this.normalizeStatus(this.request?.reimbursementStatus);

    if (!this.request?.expenseSubmitted) {
      return 'Add Expense';
    }

    if (status === 'pending') {
      return 'Reimbursement Pending';
    }

    if (status === 'approved') {
      return 'Reimbursement Approved';
    }

    if (status === 'rejected') {
      return 'Reimbursement Rejected';
    }

    return 'Expense Submitted';
  }

  getExpenseActionClass(): string {
    const status = this.normalizeStatus(this.request?.reimbursementStatus);

    if (status === 'approved') return 'expense-state-approved';
    if (status === 'rejected') return 'expense-state-rejected';
    if (status === 'pending') return 'expense-state-pending';
    return 'expense-state-neutral';
  }

  get showTripCompletedTag(): boolean {
    return (
      this.normalizeStatus(this.request?.reimbursementStatus) === 'approved'
    );
  }

  // DYNAMIC INFO NOTE (bottom of actions panel)
  get statusNote(): string {
    if (!this.request) return '';

    const final = this.normalizeStatus(this.request.finalStatus);
    const reimb = this.normalizeStatus(this.request.reimbursementStatus);

    if (this.request.isDraft) {
      return 'This is a draft. Submit it to start approval.';
    }

    if (final === 'rejected') {
      return 'Travel request was rejected.';
    }

    // Travel approved but expense not added
    if (final === 'approved' && !this.request.expenseSubmitted) {
      return 'Trip approved. Add expenses after your trip starts.';
    }

    if (reimb === 'pending') {
      return 'Expense submitted. Waiting for reimbursement approval.';
    }

    if (reimb === 'approved') {
      return 'Trip completed and reimbursement approved.';
    }

    if (reimb === 'rejected') {
      return 'Reimbursement rejected. Please review finance comments.';
    }

    return 'Request under review.';
  }

  // ACTIONS
  goBack() {
    this.router.navigate(['/employee/myrequests']);
  }

  addExpense() {
    this.router.navigate(['/employee/expense', this.request.id]);
  }

  openItinerary() {
    console.log(this.request);

    this.router.navigate([
      '/employee/itinerary',
      this.request.travelRequestId || this.request.id,
    ]);
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

    if (editForm.invalid || this.hasDateValidationErrors()) {
      editForm.form.markAllAsTouched();
      return;
    }

    this.requestService
      .updateDraft(this.selectedRequest.id, this.selectedRequest)
      .subscribe({
        next: () => {
          this.closeModal();

          this.ngOnInit();

          alert('Draft updated');
        },
      });
  }
  /**
   * Submit draft with validation: Mark isDraft as false and set initial statuses
   */
  submitDraft(editForm: NgForm) {
    this.modalSubmitted = true;

    if (editForm.invalid || this.hasDateValidationErrors()) {
      editForm.form.markAllAsTouched();
      return;
    }

    this.requestService.submitDraft(this.selectedRequest.id).subscribe({
      next: () => {
        this.closeModal();

        alert('Submitted successfully');

        this.ngOnInit();
      },
    });
  }

  /**
   * Delete draft: Remove it from localStorage and go back
   */
  deleteDraft() {
    if (!confirm('Delete this draft?')) return;

    this.requestService.deleteRequest(this.request.id).subscribe({
      next: () => {
        alert('Deleted');

        this.goBack();
      },
    });
  }

  //Edit & Cancel
  canModify(req: any): boolean {
    if (req.isDraft) {
      return true;
    }

    if (this.normalizeStatus(req.finalStatus) === 'rejected') {
      return false;
    }

    const hasPM = !!req.pmEmail || req.pmStatus !== 'not_applicable';

    const pmApproved = (req.pmStatus || '').toLowerCase() === 'approved';

    if (hasPM) {
      return !pmApproved;
    }

    return (req.managerStatus || '').toLowerCase() === 'pending';
  }

  cancelRequest(id: number) {
    if (!confirm('Cancel request?')) return;

    this.requestService.cancelRequest(id).subscribe({
      next: () => {
        alert('Cancelled');

        this.goBack();
      },
    });
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
    console.log(this.request);

    this.router.navigate([
      '/employee/itinerary',
      this.request.travelRequestId || this.request.id,
    ]);
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
