import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TravelRequestService } from '../../services/travel-request.service';
import { RequestDecision, TravelRequest } from '../../models/travel-request.model';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css',
})
export class ManagerComponent {
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(TravelRequestService);

  actionMessage = '';

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get requests(): TravelRequest[] {
    return this.requestService.getRequestsForManager();
  }

  reviewRequest(request: TravelRequest, decision: RequestDecision['decision']): void {
    const updatedRequest = this.requestService.reviewRequest(request.id, {
      reviewerRole: 'Manager',
      decision,
    });

    if (updatedRequest) {
      this.actionMessage = `Request ${request.id} has been ${decision.toLowerCase()}.`;
    }
  }

  getStatusClass(request: TravelRequest): string {
    if (request.managerStatus === 'Approved') {
      return 'bg-success';
    }

    if (request.managerStatus === 'Rejected') {
      return 'bg-danger';
    }

    return 'bg-warning text-dark';
  }

  trackByRequestId(_: number, request: TravelRequest): string {
    return request.id;
  }
}
