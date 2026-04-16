import { UserRole } from './user.model';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TravelRequest {
  id: string;
  employeeId: string;
  employeeEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  estimatedCost: number;
  managerStatus: RequestStatus;
  financeStatus: RequestStatus;
  managerComment?: string;
  financeComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelRequestForm {
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  estimatedCost: number;
}

export interface RequestDecision {
  reviewerRole: Extract<UserRole, 'Manager' | 'Finance'>;
  decision: Exclude<RequestStatus, 'Pending'>;
  comment?: string;
}
