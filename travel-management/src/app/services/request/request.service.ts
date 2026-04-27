import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  createRequest(request: any) {
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
      id: Date.now(),
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
