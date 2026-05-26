import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RequestService } from '../../../../services/request/request.service';

@Component({
  selector: 'app-empreq-details',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, MatTooltipModule, DatePipe, UpperCasePipe],
  templateUrl: './empreq-details.component.html',
  styleUrl: './empreq-details.component.css',
})
export class EmpreqDetailsComponent implements OnInit {
  request: any = null;
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  role: string = '';
  rejectReason: string = '';
  isRejecting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
  ) {}

  ngOnInit() {
    this.role = this.currentUser?.role?.toLowerCase() || 'manager';
    const id = this.route.snapshot.paramMap.get('id');
    this.loadRequest(id);
  }

  loadRequest(id: any) {
    this.requestService.getRequestById(id).subscribe({
      next: (res: any) => {
        this.request = this.normalizeRequest(res);
      },
      error: (err) => {
        console.log(err);
        alert('Request not found');
        this.goBack();
      },
    });
  }

  private normalizeStatus(status: string): string {
    return (status || '').trim().toLowerCase();
  }

  private normalizeStage(stage: string): string {
    return (stage || '').trim().toLowerCase();
  }

  private deriveStatusFlow(status: string, currentStage: string) {
    const normalizedStatus = this.normalizeStatus(status);
    const normalizedStage = this.normalizeStage(currentStage);

    const flow = {
      pmStatus: 'not_applicable',
      managerStatus: 'not_applicable',
      financeStatus: 'not_applicable',
    };

    if (normalizedStatus === 'draft') {
      return flow;
    }

    if (normalizedStatus === 'approved') {
      flow.pmStatus = 'approved';
      flow.managerStatus = 'approved';
      flow.financeStatus = 'approved';
      return flow;
    }

    if (normalizedStatus === 'rejected') {
      if (normalizedStage === 'projectmanager') {
        flow.pmStatus = 'rejected';
      } else if (normalizedStage === 'manager') {
        flow.pmStatus = 'approved';
        flow.managerStatus = 'rejected';
      } else if (normalizedStage === 'finance') {
        flow.pmStatus = 'approved';
        flow.managerStatus = 'approved';
        flow.financeStatus = 'rejected';
      } else {
        flow.pmStatus = 'rejected';
      }
      return flow;
    }

    if (normalizedStage === 'projectmanager') {
      flow.pmStatus = 'pending';
    } else if (normalizedStage === 'manager') {
      flow.pmStatus = 'approved';
      flow.managerStatus = 'pending';
    } else if (normalizedStage === 'finance') {
      flow.pmStatus = 'approved';
      flow.managerStatus = 'approved';
      flow.financeStatus = 'pending';
    } else if (normalizedStage === 'completed') {
      flow.pmStatus = 'approved';
      flow.managerStatus = 'approved';
      flow.financeStatus = 'approved';
    }

    return flow;
  }

  private normalizeRequest(res: any) {
    const currentStage = this.normalizeStage(res.currentStage);
    const finalStatus = this.normalizeStatus(res.status);

    return {
      ...res,
      id: res.travelRequestId,
      fromDate: res.startDate,
      toDate: res.endDate,
      cost: res.estimatedCost,
      finalStatus,
      currentStage,
      ...this.deriveStatusFlow(finalStatus, currentStage),
    };
  }

  // Check if current stage matches user's role and action is pending
  get canApprove(): boolean {
    if (!this.request) return false;

    if (this.role === 'projectmanager') {
      return (
        this.normalizeStatus(this.request.pmStatus) === 'pending' &&
        this.normalizeStage(this.request.currentStage) === 'projectmanager'
      );
    } else if (this.role === 'manager') {
      return (
        this.normalizeStatus(this.request.managerStatus) === 'pending' &&
        this.normalizeStage(this.request.currentStage) === 'manager'
      );
    } else if (this.role === 'finance') {
      return (
        this.normalizeStatus(this.request.financeStatus) === 'pending' &&
        this.normalizeStage(this.request.currentStage) === 'finance'
      );
    }
    return false;
  }

  approve() {
    if (!this.request) return;

    if (this.role === 'projectmanager') {
      this.requestService
        .updatePMStatus(this.request.id, 'approved')
        .subscribe({
          next: () => {
            alert('Request approved successfully');
            this.loadRequest(this.request.id);
          },
          error: (err: any) => {
            console.log(err);
            alert('Error approving request');
          },
        });
      return;
    }

    if (this.role === 'manager') {
      this.requestService
        .updateManagerStatus(this.request.id, 'approved')
        .subscribe({
          next: () => {
            alert('Request approved successfully');
            this.loadRequest(this.request.id);
          },
          error: (err: any) => {
            console.log(err);
            alert('Error approving request');
          },
        });
      return;
    }

    // finance
    this.requestService
      .updateFinanceStatus(this.request.id, 'approved')
      .subscribe({
        next: () => {
          alert('Request approved successfully');
          this.loadRequest(this.request.id);
        },
        error: (err: any) => {
          console.log(err);
          alert('Error approving request');
        },
      });
  }

  openReject() {
    this.isRejecting = true;
  }

  cancelReject() {
    this.isRejecting = false;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!this.request) return;

    const payload = {
      travelRequestId: this.request.id,
      comments: this.rejectReason,
    };

    if (this.role === 'projectmanager') {
      this.requestService
        .updatePMStatus(this.request.id, 'rejected', this.rejectReason)
        .subscribe({
          next: () => {
            alert('Request rejected successfully');
            this.loadRequest(this.request.id);
            this.isRejecting = false;
            this.rejectReason = '';
          },
          error: (err: any) => {
            console.log(err);
            alert('Error rejecting request');
          },
        });
      return;
    }

    if (this.role === 'manager') {
      this.requestService
        .updateManagerStatus(this.request.id, 'rejected', this.rejectReason)
        .subscribe({
          next: () => {
            alert('Request rejected successfully');
            this.loadRequest(this.request.id);
            this.isRejecting = false;
            this.rejectReason = '';
          },
          error: (err: any) => {
            console.log(err);
            alert('Error rejecting request');
          },
        });
      return;
    }

    // finance
    this.requestService
      .updateFinanceStatus(this.request.id, 'rejected', this.rejectReason)
      .subscribe({
        next: () => {
          alert('Request rejected successfully');
          this.loadRequest(this.request.id);
          this.isRejecting = false;
          this.rejectReason = '';
        },
        error: (err: any) => {
          console.log(err);
          alert('Error rejecting request');
        },
      });
  }

  goBack() {
    const basePath = this.role === 'projectmanager' ? '/pm' : '/manager';
    this.router.navigate([basePath + '/approval']);
  }

  getAvatarColor(email: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const hash = email
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getInitials(email: string): string {
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  // Returns true only for index 0 (used in itinerary template)
  isFirst(index: number): boolean {
    return index === 0;
  }

  // Returns different icon background color per day position
  getDayIconClass(day: any): string {
    const n = day.dayNumber;
    if (n === 1) return 'icon-blue'; // first day — plane
    if (n === this.request.itinerary.length) return 'icon-green'; // last day
    return 'icon-indigo'; // middle days
  }
}
