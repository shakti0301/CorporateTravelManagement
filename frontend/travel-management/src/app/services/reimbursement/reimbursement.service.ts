import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReimbursementService {
  private apiUrl = `${environment.apiUrl}/Reimbursement`;

  constructor(private http: HttpClient) {}

  getFinanceReimbursements() {
    return this.http.get(`${this.apiUrl}/finance`);
  }

  // employee submit expenses
  submitExpenses(data: any) {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }

  // finance dashboard
  getFinanceRequests() {
    return this.http.get(`${this.apiUrl}/finance`);
  }

  // employee history
  getMyReimbursements() {
    return this.http.get(`${this.apiUrl}/my`);
  }

  approve(reimbursementId: number, remarks: string = '') {
    return this.http.post(`${this.apiUrl}/approve`, {
      reimbursementId,
      remarks,
    });
  }

  reject(reimbursementId: number, remarks: string) {
    return this.http.post(`${this.apiUrl}/reject`, {
      reimbursementId,
      remarks,
    });
  }
}
