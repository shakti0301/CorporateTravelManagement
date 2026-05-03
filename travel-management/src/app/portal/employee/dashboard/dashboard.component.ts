import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RequestService } from '../../../services/request/request.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js/auto';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  requests: any[] = [];
  currentYear = new Date().getFullYear();

  monthlyChart: any;
  statusChart: any;
  private resizeTimer: any;

  constructor(
    private requestService: RequestService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.requests = this.requestService.getRequestsByUser();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
      this.setupResizeListener();
    }, 100);
  }

  ngOnDestroy() {
    this.monthlyChart?.destroy();
    this.statusChart?.destroy();
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.monthlyChart?.resize();
      this.statusChart?.resize();
    }, 250);
  };

  private setupResizeListener() {
    window.addEventListener('resize', this.onResize);
  }

  createCharts() {
    this.createMonthlyChart();
    this.createStatusChart();
  }

  // ---- MONTHLY BAR CHART (last 6 months, dual-dataset: reimbursed vs budgeted) ----
  createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.monthlyChart?.destroy();

    const today = new Date();
    const labels: string[] = [];
    const reimbursedData: number[] = [];
    const budgetedData: number[] = [];

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      labels.push(monthNames[m]);

      let reimbursed = 0;
      let budgeted = 0;

      this.requests.forEach((r) => {
        const from = new Date(r.fromDate);
        if (from.getMonth() === m && from.getFullYear() === y) {
          const total = Number(r.totalExpense || r.budget || 0);
          if (r.reimbursementStatus === 'approved') {
            reimbursed += total;
          } else {
            budgeted += total;
          }
        }
        // Also include individual expenses
        if (r.expenses) {
          r.expenses.forEach((e: any) => {
            const expDate = new Date(e.date);
            if (expDate.getMonth() === m && expDate.getFullYear() === y) {
              if (r.reimbursementStatus === 'approved') {
                reimbursed += Number(e.amount || 0);
              } else {
                budgeted += Number(e.amount || 0);
              }
            }
          });
        }
      });

      reimbursedData.push(reimbursed);
      budgetedData.push(budgeted);
    }

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Reimbursed',
            data: reimbursedData,
            backgroundColor: '#2563eb',
            borderRadius: 6,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
            order: 1,
          },
          {
            label: 'Budgeted',
            data: budgetedData,
            backgroundColor: '#bfdbfe',
            borderRadius: 6,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: { size: 12 },
              color: '#64748b',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15,23,42,0.9)',
            padding: 12,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } },
            stacked: false,
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { color: '#94a3b8', font: { size: 11 }, padding: 6 },
          },
        },
      },
    });
  }

  // ---- DONUT CHART ----
  createStatusChart() {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.statusChart?.destroy();

    const approved = this.approvedTrips;
    const pending = this.pendingApproval;
    const rejected = this.rejectedRequests;
    const total = approved + pending + rejected;

    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        const { width, height, ctx: c } = chart;
        c.save();

        c.font = `700 22px 'Segoe UI', sans-serif`;
        c.fillStyle = '#0f172a';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(total.toString(), width / 2, height / 2 - 8);

        c.font = `500 12px 'Segoe UI', sans-serif`;
        c.fillStyle = '#94a3b8';
        c.fillText('TOTAL', width / 2, height / 2 + 14);
        c.restore();
      },
    };

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Rejected/Draft'],
        datasets: [
          {
            data: [approved || 0, pending || 0, rejected || 0],
            backgroundColor: ['#22c55e', '#f59e0b', '#e2e8f0'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverBorderWidth: 4,
            spacing: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            padding: 10,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }

  // ---- ACTIONS ----
  createRequest() {
    this.router.navigate(['/employee/request']);
  }

  viewAllRequests() {
    this.router.navigate(['/employee/myrequests']);
  }

  viewTripDetails(trip: any) {
    this.router.navigate(['/employee/myrequests', trip.id]);
  }

  // ---- GETTERS ----
  get totalRequests() {
    return this.requests.length;
  }

  get pendingApproval() {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'pending',
    ).length;
  }

  get approvedTrips() {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'approved',
    ).length;
  }

  get rejectedRequests() {
    return this.requests.filter(
      (r) =>
        (r.finalStatus || '').toLowerCase() === 'rejected' ||
        (r.finalStatus || '').toLowerCase() === 'draft',
    ).length;
  }

  get totalReimbursed() {
    return this.requests.reduce(
      (sum, r) =>
        r.reimbursementStatus === 'approved'
          ? sum + Number(r.totalExpense || 0)
          : sum,
      0,
    );
  }

  get pendingReimbursements(): number {
    return this.requests.filter(
      (r) => r.expenseSubmitted && r.reimbursementStatus === 'pending',
    ).length;
  }

  get currentTrips() {
    const today = new Date();
    return this.requests.filter((r) => {
      if ((r.finalStatus || '').toLowerCase() !== 'approved') return false;
      const from = new Date(r.fromDate);
      const to = new Date(r.toDate);
      return today >= from && today <= to;
    });
  }

  get upcomingTrips() {
    const today = new Date();
    return this.requests
      .filter((r) => {
        if ((r.finalStatus || '').toLowerCase() !== 'approved') return false;
        return new Date(r.fromDate) > today;
      })
      .sort(
        (a, b) =>
          new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime(),
      );
  }

  // ---- PERCENTAGE HELPERS ----
  get approvedPct() {
    return this._pct(this.approvedTrips);
  }
  get pendingPct() {
    return this._pct(this.pendingApproval);
  }
  get rejectedPct() {
    return this._pct(this.rejectedRequests);
  }

  private _pct(val: number) {
    const total =
      this.approvedTrips + this.pendingApproval + this.rejectedRequests;
    if (!total) return 0;
    return Math.round((val / total) * 100);
  }

  // ---- TRIP PROGRESS HELPERS ----
  getTripDuration(trip: any): number {
    const from = new Date(trip.fromDate);
    const to = new Date(trip.toDate);
    const diff = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff + 1;
  }

  getTripDay(trip: any): number {
    const from = new Date(trip.fromDate);
    const today = new Date();
    const diff = Math.ceil(
      (today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, diff + 1);
  }

  getTripProgress(trip: any): number {
    const day = this.getTripDay(trip);
    const duration = this.getTripDuration(trip);
    return Math.min(100, Math.round((day / duration) * 100));
  }

  getDaysUntil(trip: any): number {
    const from = new Date(trip.fromDate);
    const today = new Date();
    return Math.ceil(
      (from.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
