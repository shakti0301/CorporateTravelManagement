import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../../services/request/request.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  requests: any[] = [];

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
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        if (this.monthlyChart && this.statusChart) {
          this.monthlyChart.resize();
          this.statusChart.resize();
        }
      }, 250);
    });
  }

  createCharts() {
    this.createMonthlyChart();
    this.createStatusChart();
  }

  // MONTHLY BAR CHART
  createMonthlyChart() {
    const monthly = new Array(12).fill(0);

    this.requests.forEach((r) => {
      if (r.expenses) {
        r.expenses.forEach((e: any) => {
          const month = new Date(e.date).getMonth();
          monthly[month] += Number(e.amount || 0);
        });
      }
    });

    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
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
        ],
        datasets: [
          {
            label: 'Monthly Spending',
            data: monthly,
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            barThickness: 'flex',
            maxBarThickness: 24,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'x',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            borderColor: '#e2e8f0',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              padding: 8,
            },
          },
        },
      },
    });
  }

  // DONUT CHART
  createStatusChart() {
    const approved = this.approvedTrips;
    const pending = this.pendingApproval;
    const rejected = this.rejectedRequests;
    const total = approved + pending + rejected;

    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const centerText = {
      id: 'centerText',
      beforeDraw(chart: any) {
        const { width, height } = chart;
        const ctx = chart.ctx;

        ctx.save();
        ctx.font = '600 18px Inter';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(total, width / 2, height / 2 - 5);

        ctx.font = '12px Inter';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Total', width / 2, height / 2 + 15);
        ctx.restore();
      },
    };

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
          {
            label: 'Request Status',
            data: [approved, pending, rejected],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderColor: 'white',
            borderWidth: 2,
            hoverBorderWidth: 3,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 14,
              font: { size: 11, weight: 'bold' },
              color: '#64748b',
            },
          },
          tooltip: {
            mode: 'index',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            borderColor: '#e2e8f0',
            borderWidth: 1,
            displayColors: true,
            padding: 12,
          },
        },
      },
      plugins: [centerText],
    });
  }

  createRequest() {
    this.router.navigate(['/employee/request']);
  }

  get totalRequests() {
    return this.requests.length;
  }

  get pendingApproval() {
    return this.requests.filter(
      (r) => (r.managerStatus || '').toLowerCase() === 'pending',
    ).length;
  }

  get approvedTrips() {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'approved',
    ).length;
  }

  get rejectedRequests() {
    return this.requests.filter(
      (r) => (r.finalStatus || '').toLowerCase() === 'rejected',
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

  currentYear = new Date().getFullYear();
}
