import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/TravelRequest`;

  constructor(private http: HttpClient) {}

  // Employee creates request
  createRequest(requestData: any) {
    return this.http.post(this.apiUrl, requestData);
  }

  // Employee requests
  getMyRequests() {
    return this.http.get(`${this.apiUrl}/my`);
  }

  getDraftRequests() {
    return this.http.get(`${environment.apiUrl}/TravelRequest/drafts`);
  }

  // Manager
  getPendingManagerRequests() {
    return this.http.get(`${this.apiUrl}/pending/manager`);
  }

  // PM
  getPendingPMRequests() {
    return this.http.get(`${this.apiUrl}/pending/pm`);
  }

  // Finance
  getPendingFinanceRequests() {
    return this.http.get(`${this.apiUrl}/pending/finance`);
  }

  approveReject(data: any) {
    console.log('Sending:', data);
    return this.http.post(`${this.apiUrl}/approve`, data);
  }

  updateManagerStatus(
    travelRequestId: number,
    status: string,
    comments: string = '',
  ) {
    return this.approveReject({
      travelRequestId,
      status: status === 'approved' ? 2 : 3,
      comments,
    });
  }

  updatePMStatus(
    travelRequestId: number,
    status: string,
    comments: string = '',
  ) {
    return this.approveReject({
      travelRequestId,
      status: status === 'approved' ? 2 : 3,
      comments,
    });
  }

  updateFinanceStatus(travelRequestId: number, status: string) {
    return this.approveReject({
      travelRequestId,
      status: status === 'approved' ? 2 : 3,
      comments: '',
    });
  }

  //Temorary: for removing errors
  getRequestsByUser() {
    return [];
  }

  getAllRequests() {
    return [];
  }
}
