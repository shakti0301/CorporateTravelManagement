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

  getAllRequests(): any[] {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    return requests.filter((r: any) => r.expenseSubmitted === true);
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
