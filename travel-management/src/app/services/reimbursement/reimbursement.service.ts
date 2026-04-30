import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReimbursementService {
  constructor() {}

  private getRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
  }

  private saveRequests(requests: any[]) {
    localStorage.setItem('requests', JSON.stringify(requests));
  }

  getPendingRequests() {
    return this.getRequests().filter(
      (req: any) =>
        req.expenseSubmitted === true && req.reimbursementStatus === 'pending',
    );
  }

  approve(id: number) {
    let requests = this.getRequests();

    requests = requests.map((r: any) => {
      if (r.id === id) {
        return {
          ...r,
          reimbursementStatus: 'approved',
          reimbursementRemark: 'Approved by manager',
        };
      }
      return r;
    });
    this.saveRequests(requests);
  }

  reject(id: number, reason: string) {
    let requests = this.getRequests();

    requests = requests.map((r: any) => {
      if (r.id === id) {
        return {
          ...r,
          reimbursementStatus: 'rejected',
          reimbursementRemark: reason,
        };
      }
      return r;
    });
    this.saveRequests(requests);
  }
}
