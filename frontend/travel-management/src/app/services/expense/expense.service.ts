import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get request details from DB
  getRequestById(requestId: number) {
    return this.http.get(`${this.apiUrl}/TravelRequest/${requestId}`);
  }

  // draft expenses (temporary)
  saveExpensesAsDraft(requestId: number, expenses: any[]) {
    localStorage.setItem(`draft_${requestId}`, JSON.stringify(expenses));
  }

  getExpenseDraft(requestId: number) {
    return JSON.parse(localStorage.getItem(`draft_${requestId}`) || '[]');
  }

  clearDraft(requestId: number) {
    localStorage.removeItem(`draft_${requestId}`);
  }

  submitExpenses(data: any) {
    return this.http.post(
      `${this.apiUrl}/Reimbursement/submit`,

      data,
    );
  }
}
