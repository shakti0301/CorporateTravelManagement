import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor() {}

  private getRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
  }

  private saveRequests(requests: any[]) {
    localStorage.setItem('requests', JSON.stringify(requests));
  }

  getRequestById(requestId: number) {
    const requests = this.getRequests();
    return requests.find((r: any) => r.id == requestId);
  }

  saveExpenses(requestId: number, expenses: any[]) {
    let requests = this.getRequests();

    requests = requests.map((r: any) => {
      if (r.id == requestId) {
        const totalExpense = expenses.reduce(
          (sum, e) => sum + Number(e.amount || 0),
          0,
        );

        const approvedAmount = Number(r.cost || 0);

        return {
          ...r,
          expenses,
          expenseSubmitted: true,
          totalExpense,
          remainingAmount: approvedAmount - totalExpense,
          reimbursementStatus: 'pending',
          reimbursementRemark: '',
        };
      }
      return r;
    });
    this.saveRequests(requests);
  }
}
