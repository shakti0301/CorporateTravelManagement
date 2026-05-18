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

  approveRequest(data: any) {
    return this.http.post(`${this.apiUrl}/approve`, data);
  }

  //Temorary: for removing errors
  getRequestsByUser() {
    return [];
  }

  getAllRequests() {
    return [];
  }

  updateManagerStatus(id: number, status: string) {}

  updatePMStatus(id: number, status: string) {}

  updateFinanceStatus(id: number, status: string) {}
}
