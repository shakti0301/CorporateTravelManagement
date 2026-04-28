import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { RequestService } from '../../../services/request/request.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  requests: any[] = [];
  selectedRequest: any = null;
  showModal: boolean = false;
  modalSubmitted: boolean = false;

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.requests = this.requestService.getRequestsByUser();
  }

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

  formatStatus(status: string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'not_applicable') {
      return 'Not Required';
    }

    return normalized
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private normalizeStatus(status: string): string {
    return (status || 'pending').trim().toLowerCase();
  }

  get today(): string {
    return this.formatDateForInput(new Date());
  }

  get toDateMin(): string {
    const fromDate = this.selectedRequest?.fromDate;

    if (!fromDate) {
      return this.today;
    }

    return fromDate > this.today ? fromDate : this.today;
  }

  openEditModal(request: any) {
    this.selectedRequest = request;
    this.modalSubmitted = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.modalSubmitted = false;
  }

  saveDraft(editForm: NgForm) {
    this.modalSubmitted = true;

    if (this.hasDateValidationErrors()) {
      editForm.form.markAllAsTouched();
      return;
    }

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id === this.selectedRequest.id) {
        return {
          ...this.selectedRequest,
          isDraft: true,
        };
      }
      return r;
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    this.closeModal();
    this.ngOnInit();
  }

  submitFromModal(editForm: NgForm) {
    this.modalSubmitted = true;

    if (editForm.invalid || this.hasDateValidationErrors()) {
      editForm.form.markAllAsTouched();
      return;
    }

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id === this.selectedRequest.id) {
        return {
          ...this.selectedRequest,
          isDraft: false,
          managerStatus: 'pending',
          financeStatus: 'not_applicable',
          finalStatus: 'pending',
        };
      }
      return r;
    });
    localStorage.setItem('requests', JSON.stringify(requests));

    this.closeModal();
    this.ngOnInit();
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

  private isPastDate(dateValue: string): boolean {
    if (!dateValue) {
      return false;
    }

    const selectedDate = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  canModify(req: any) {
    return req.isDraft || this.normalizeStatus(req.managerStatus) === 'pending';
  }

  deleteRequest(id: number) {
    const confirmDelete = confirm(
      'Are you sure you want to delete/cancel this request?',
    );
    if (!confirmDelete) return;

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests = requests.filter((r: any) => r.id != id);

    localStorage.setItem('requests', JSON.stringify(requests));
    this.ngOnInit();
  }
}
