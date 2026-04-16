import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { RequestDecision, TravelRequest } from '../../models/travel-request.model';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css',
})
export class FinanceComponent {
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(TravelRequestService);

  actionMessage = '';

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get requests(): TravelRequest[] {
    return this.requestService.getRequestsForFinance();
  }

  reviewRequest(request: TravelRequest, decision: RequestDecision['decision']): void {
    const updatedRequest = this.requestService.reviewRequest(request.id, {
      reviewerRole: 'Finance',
      decision,
    });

    if (updatedRequest) {
      this.actionMessage = `Request ${request.id} has been ${decision.toLowerCase()}.`;
    }
  }

  getStatusClass(request: TravelRequest): string {
    if (request.financeStatus === 'Approved') {
      return 'bg-success';
    }

    if (request.financeStatus === 'Rejected') {
      return 'bg-danger';
    }

    return 'bg-warning text-dark';
  }

  trackByRequestId(_: number, request: TravelRequest): string {
    return request.id;
  }
}
