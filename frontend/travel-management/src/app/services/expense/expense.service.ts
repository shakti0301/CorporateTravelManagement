import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = 'http://localhost:5212/api/Reimbursement';

  constructor(private http: HttpClient) {}

  // Draft storage only
  saveExpensesAsDraft(requestId: any, expenses: any[]) {
    localStorage.setItem(`expenseDraft_${requestId}`, JSON.stringify(expenses));
  }

  getExpenseDraft(requestId: any): any[] {
    return JSON.parse(
      localStorage.getItem(`expenseDraft_${requestId}`) || '[]',
    );
  }

  clearDraft(requestId: any) {
    localStorage.removeItem(`expenseDraft_${requestId}`);
  }

  // Backend APIs
  getRequestById(id: any) {
    return this.http.get(`http://localhost:5212/api/TravelRequest/${id}`);
  }

  submitExpenses(data: any) {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }

  getMyReimbursements() {
    return this.http.get(`${this.apiUrl}/my`);
  }

  getFinanceReimbursements() {
    return this.http.get(`${this.apiUrl}/finance`);
  }

  approve(id: number) {
    return this.http.put(`${this.apiUrl}/approve/${id}`, {});
  }

  reject(id: number, remarks: string) {
    return this.http.put(`${this.apiUrl}/reject/${id}`, {
      remarks,
    });
  }
}
