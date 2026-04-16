import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  RequestDecision,
  RequestStatus,
  TravelRequest,
  TravelRequestForm,
} from '../models/travel-request.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class TravelRequestService {
  private readonly STORAGE_KEY = 'travel_app_requests';
  private readonly requestsSubject = new BehaviorSubject<TravelRequest[]>(this.loadRequests());

  requests$ = this.requestsSubject.asObservable();

  private loadRequests(): TravelRequest[] {
    const storedValue = localStorage.getItem(this.STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    try {
      return JSON.parse(storedValue) as TravelRequest[];
    } catch {
      return [];
    }
  }

  private persistRequests(requests: TravelRequest[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    this.requestsSubject.next(requests);
  }

  getRequests(): TravelRequest[] {
    return this.requestsSubject.value;
  }

  getRequestsForEmployee(employeeId: string): TravelRequest[] {
    return this.getRequests().filter((request) => request.employeeId === employeeId);
  }

  getRequestsForManager(): TravelRequest[] {
    return this.getRequests().filter((request) => request.managerStatus === 'Pending');
  }

  getRequestsForFinance(): TravelRequest[] {
    return this.getRequests().filter(
      (request) => request.managerStatus === 'Approved' && request.financeStatus === 'Pending',
    );
  }

  createRequest(user: User, requestData: TravelRequestForm): TravelRequest {
    const now = new Date().toISOString();
    const newRequest: TravelRequest = {
      id: `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      employeeId: user.id,
      employeeEmail: user.email,
      destination: requestData.destination,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      purpose: requestData.purpose,
      estimatedCost: requestData.estimatedCost,
      managerStatus: 'Pending',
      financeStatus: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    const requests = [newRequest, ...this.getRequests()];
    this.persistRequests(requests);
    return newRequest;
  }

  reviewRequest(requestId: string, decisionPayload: RequestDecision): TravelRequest | null {
    const requests = [...this.getRequests()];
    const requestIndex = requests.findIndex((request) => request.id === requestId);

    if (requestIndex === -1) {
      return null;
    }

    const request = { ...requests[requestIndex] };

    if (decisionPayload.reviewerRole === 'Manager') {
      request.managerStatus = decisionPayload.decision;
      request.managerComment = decisionPayload.comment?.trim() || request.managerComment;
    }

    if (decisionPayload.reviewerRole === 'Finance') {
      request.financeStatus = decisionPayload.decision;
      request.financeComment = decisionPayload.comment?.trim() || request.financeComment;
    }

    request.updatedAt = new Date().toISOString();
    requests[requestIndex] = request;
    this.persistRequests(requests);
    return request;
  }

  getOverallStatus(request: TravelRequest): RequestStatus {
    if (request.managerStatus === 'Rejected' || request.financeStatus === 'Rejected') {
      return 'Rejected';
    }

    if (request.managerStatus === 'Approved' && request.financeStatus === 'Approved') {
      return 'Approved';
    }

    return 'Pending';
  }
}
