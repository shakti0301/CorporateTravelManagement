import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { TravelRequest, TravelRequestForm } from '../../models/travel-request.model';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(TravelRequestService);

  errorMessage = '';
  successMessage = '';

  requestForm = this.fb.group({
    destination: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    purpose: ['', [Validators.required, Validators.minLength(8)]],
    estimatedCost: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get requests(): TravelRequest[] {
    const user = this.currentUser;
    return user ? this.requestService.getRequestsForEmployee(user.id) : [];
  }

  submitRequest(): void {
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to create a request.';
      return;
    }

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    const requestData = this.requestForm.getRawValue() as TravelRequestForm;
    const request = this.requestService.createRequest(this.currentUser, requestData);
    this.successMessage = `Request ${request.id} sent to manager and finance for review.`;
    this.requestForm.reset();
  }

  getStatusLabel(request: TravelRequest): string {
    return this.requestService.getOverallStatus(request);
  }

  getStatusClass(request: TravelRequest): string {
    const status = this.getStatusLabel(request);

    if (status === 'Approved') {
      return 'bg-success';
    }

    if (status === 'Rejected') {
      return 'bg-danger';
    }

    return 'bg-warning text-dark';
  }

  trackByRequestId(_: number, request: TravelRequest): string {
    return request.id;
  }
}
