import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

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

  constructor(private reimbursementService: ReimbursementService) {}

  ngOnInit() {
    this.refreshList();
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
    this.reimbursementService.approve(this.selectedRequest.id);

    this.closeModal();
    this.refreshList();
  }

  rejectRequest() {
    const reason = prompt('Enter rejection reason');

    if (!reason) return;

    this.reimbursementService.reject(this.selectedRequest.id, reason);

    this.closeModal();
    this.refreshList();
  }

  refreshList() {
    this.reimbursementRequests = this.reimbursementService.getPendingRequests();
  }
}
