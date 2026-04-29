import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reimbursements',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './reimbursements.component.html',
  styleUrl: './reimbursements.component.css',
})
export class ReimbursementsComponent {
  reimbursementRequests: any[] = [];
  selectedRequest: any = null;
  showModal: boolean = false;

  ngOnInit() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    this.reimbursementRequests = requests.filter(
      (req: any) =>
        req.expenseSubmitted === true && req.reimbursementStatus === 'pending',
    );
  }

  openDetails(req: any) {
    this.selectedRequest = req;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
  }

  readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('File reading failed');

      reader.readAsDataURL(file);
    });
  }

  viewProof(expense: any) {
    // Implementation for viewing proof
  }

  approveRequest() {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id === this.selectedRequest.id) {
        return {
          ...r,
          reimbursementStatus: 'approved',
          reimbursementRemark: 'Approved by finance',
        };
      }
      return r;
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    this.closeModal();
    this.refreshList();
  }

  rejectRequest() {
    let reason = prompt('Enter rejection reason');

    if (!reason) return;

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id === this.selectedRequest.id) {
        return {
          ...r,
          reimbursementStatus: 'rejected',
          reimbursementRemark: reason,
        };
      }
      return r;
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    this.closeModal();
    this.refreshList();
  }

  refreshList() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    this.reimbursementRequests = requests.filter(
      (req: any) =>
        req.expenseSubmitted === true && req.reimbursementStatus === 'pending',
    );
  }
}
