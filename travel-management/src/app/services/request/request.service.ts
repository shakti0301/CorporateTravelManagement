import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private generateTripId(): string {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const existingIds = new Set(allRequests.map((r: any) => r.tripId));

    let tripId: string;
    do {
      const random = Math.floor(1000 + Math.random() * 9000); // always 4 digits
      tripId = `TRP-${random}`;
    } while (existingIds.has(tripId)); // regenerate if already taken

    return tripId;
  }

  createRequest(request: any, isDraft: boolean = false) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    let user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.email) {
      alert('User not logged in');
      return;
    }

    const newRequest = {
      ...request,
      userEmail: user.email,
      managerStatus: 'pending',
      financeStatus: 'not_applicable',
      finalStatus: 'pending',
      reason: '',
      isDraft: isDraft,
      id: Date.now(),
      tripId: this.generateTripId(),
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(requests));
  }

  getRequestsByUser() {
    const request = JSON.parse(localStorage.getItem('requests') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    return request.filter((req: any) => req.userEmail === user.email);
  }

  getAllRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
  }

  updateManagerStatus(id: number, status: string) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((req: any) => {
      if (req.id === id) {
        req.managerStatus = status;

        if (status === 'rejected') {
          req.finalStatus = 'rejected';
          req.financeStatus = 'not_applicable';
          req.reason = 'Manager rejected the request';
        }

        if (status === 'approved') {
          req.financeStatus = 'pending';
        }
      }
      return req;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
  }

  updateFinanceStatus(id: number, status: string) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((req: any) => {
      if (req.id === id) {
        req.financeStatus = status;

        if (status === 'rejected') {
          req.finalStatus = 'rejected';
          req.reason = 'Finance rejected the request';
        }

        if (req.managerStatus === 'approved' && status === 'approved') {
          req.finalStatus = 'approved';
        }
      }
      return req;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
  }
}
