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

    const hasPM = request.pmEmail && request.pmEmail.trim() !== '';

    if (!user.email) {
      alert('User not logged in');
      return;
    }

    const newRequest = {
      ...request,
      userEmail: user.email,
      pmEmail: hasPM ? request.pmEmail : null,
      pmStatus: hasPM ? 'pending' : 'not_applicable',
      managerStatus: hasPM ? 'not_applicable' : 'pending',
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

  getPendingManagerRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    return requests.filter(
      (req: any) => req.managerStatus === 'pending' && !req.isDraft,
    );
  }

  getPendingPMRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return requests.filter(
      (req: any) =>
        req.pmEmail === user.email &&
        req.pmStatus === 'pending' &&
        !req.isDraft,
    );
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

  updatePMStatus(id: number, status: string, reason: string = '') {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((req: any) => {
      if (req.id === id) {
        req.pmStatus = status;

        if (status === 'rejected') {
          req.finalStatus = 'rejected';
          req.managerStatus = 'not_applicable';
          req.financeStatus = 'not_applicable';
          req.reason = reason || 'Project Manager rejected the request';
        }

        if (status === 'approved') {
          req.managerStatus = 'pending'; // now passes to manager
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
