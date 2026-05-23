import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../../services/request/request.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.css',
})
export class MyRequestsComponent implements OnInit {
  requests: any[] = [];
  selectedRequest: any = null;
  showModal: boolean = false;
  modalSubmitted: boolean = false;

  // FILTER STATE
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';

  // PAGINATION
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getMyRequests().subscribe({
      next: (response: any) => {
        this.requestService.getDraftRequests().subscribe({
          next: (drafts: any) => {
            const normal = response.map((r: any) => ({
              ...r,
              id: r.travelRequestId,
              fromDate: r.startDate,
              toDate: r.endDate,
              finalStatus: this.normalizeStatus(r.status),
              currentStage: this.normalizeStage(r.currentStage),
              ...this.deriveStatusFlow(r.status, r.currentStage, r),
              isDraft: false,
            }));

            const draftData = drafts.map((d: any) => ({
              ...d,
              id: d.travelRequestId,
              fromDate: d.startDate,
              toDate: d.endDate,
              finalStatus: this.normalizeStatus(d.status || 'draft'),
              isDraft: true,
            }));

            this.requests = [...draftData, ...normal];
            console.log(this.requests);
          },
        });
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  // STATS
  get totalRequests(): number {
    return this.requests.length;
  }

  get approvedRequests(): number {
    return this.requests.filter(
      (req) => this.normalizeStatus(req.finalStatus) === 'approved',
    ).length;
  }

  get pendingRequests(): number {
    return this.requests.filter(
      (req) => this.normalizeStatus(req.finalStatus) === 'pending',
    ).length;
  }

  // FILTERING
  get filteredRequests(): any[] {
    let result = [...this.requests];

    // Search — matches destination or purpose
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          (r.source || '').toLowerCase().includes(q) ||
          (r.destination || '').toLowerCase().includes(q) ||
          (r.purpose || '').toLowerCase().includes(q),
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      result = result.filter((r) => {
        if (this.statusFilter === 'draft') return r.isDraft;
        if (this.statusFilter === 'pending')
          return (
            !r.isDraft && this.normalizeStatus(r.finalStatus) === 'pending'
          );
        if (this.statusFilter === 'approved')
          return this.normalizeStatus(r.finalStatus) === 'approved';
        if (this.statusFilter === 'rejected')
          return this.normalizeStatus(r.finalStatus) === 'rejected';
        return true;
      });
    }

    // Date filter — matches requests whose fromDate >= selected date
    if (this.dateFilter) {
      result = result.filter((r) => r.fromDate >= this.dateFilter);
    }

    return result;
  }

  // PAGINATION
  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.pageSize);
  }

  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  get showingFrom(): number {
    if (this.filteredRequests.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredRequests.length,
    );
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Reset to page 1 when filters change
  onFilterChange() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.currentPage = 1;
  }

  // STATUS HELPERS
  formatStatus(status: string): string {
    const normalized = this.normalizeStatus(status);
    if (normalized === 'not_applicable') return 'Not Required';
    return normalized
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private normalizeStatus(status: string): string {
    return (status || 'pending').trim().toLowerCase();
  }

  private normalizeStage(stage: string): string {
    return (stage || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  private deriveStatusFlow(status: string, currentStage: string, req?: any) {
    const normalizedStatus = this.normalizeStatus(status);

    const normalizedStage = this.normalizeStage(currentStage);

    const hasPM = req?.pmEmail && req.pmEmail.trim() !== '';

    const flow = {
      pmStatus: hasPM ? 'pending' : 'not_applicable',

      managerStatus: hasPM ? 'not_applicable' : 'pending',

      financeStatus: 'not_applicable',
    };

    // Draft
    if (normalizedStatus === 'draft') {
      return flow;
    }

    // Fully approved travel
    if (normalizedStatus === 'approved') {
      flow.pmStatus = hasPM ? 'approved' : 'not_applicable';

      flow.managerStatus = 'approved';

      flow.financeStatus = 'approved';

      return flow;
    }

    // Rejected flow
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

    // Pending stages

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

  getPmPillClass(req: any): string {
    const s = this.normalizeStatus(req.pmStatus);
    if (s === 'approved') return 'pill-approved';
    if (s === 'rejected') return 'pill-rejected';
    if (s === 'not_applicable') return 'pill-neutral';
    return 'pill-pending';
  }

  getManagerPillClass(req: any): string {
    const s = this.normalizeStatus(req.managerStatus);
    if (s === 'approved') return 'pill-approved';
    if (s === 'rejected') return 'pill-rejected';
    if (s === 'not_applicable') return 'pill-neutral';
    return 'pill-pending';
  }

  getFinancePillClass(req: any): string {
    const s = this.normalizeStatus(req.financeStatus);
    if (s === 'approved') return 'pill-approved';
    if (s === 'rejected') return 'pill-rejected';
    if (s === 'not_applicable') return 'pill-neutral';
    return 'pill-pending';
  }

  getReimbursementPillClass(req: any): string {
    const s = this.normalizeStatus(req.reimbursementStatus);
    if (s === 'approved') return 'pill-approved';
    if (s === 'rejected') return 'pill-rejected';
    return 'pill-pending';
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
    return Boolean(
      this.isPastDate(this.selectedRequest?.fromDate) ||
      this.isPastDate(this.selectedRequest?.toDate) ||
      (this.selectedRequest?.fromDate &&
        this.selectedRequest?.toDate &&
        new Date(this.selectedRequest.fromDate) >
          new Date(this.selectedRequest.toDate)),
    );
  }

  // MODAL
  openEditModal(request: any) {
    this.selectedRequest = { ...request };
    this.modalSubmitted = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.modalSubmitted = false;
  }

  saveDraft(editForm: NgForm) {
    alert('Backend update API not connected yet');
  }

  submitFromModal(editForm: NgForm) {
    alert('Backend update API not connected yet');
  }

  // ACTIONS
  canModify(req: any): boolean {
    // Check if request has a Project Manager assigned
    const hasPM = req.pmEmail && req.pmEmail.trim() !== '';
    const pmApproved = this.normalizeStatus(req.pmStatus) === 'approved';

    // If PM exists and PM has approved, employee CANNOT edit/cancel
    if (hasPM && pmApproved) {
      return false;
    } else if (hasPM) {
      // If PM exists but hasn't approved, employee CAN edit/cancel
      return true;
    }

    // Otherwise, original logic: can edit if draft or manager status is pending
    return req.isDraft || this.normalizeStatus(req.managerStatus) === 'pending';
  }

  deleteRequest(id: number) {
    alert('Delete API pending');
  }
}
