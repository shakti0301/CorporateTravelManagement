import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css',
})
export class PoliciesComponent implements OnInit {
  policies: any[] = [];
  loading = true;
  editingId: number | null = null;
  editBudget: number = 0;
  saving = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.loading = true;
    this.authService.getAllPolicies().subscribe({
      next: (res: any) => {
        this.policies = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: () => {
        this.policies = [];
        this.loading = false;
      },
    });
  }

  startEdit(policy: any) {
    this.editingId = policy.travelPolicyId;
    this.editBudget = policy.maxBudget;
  }

  cancelEdit() {
    this.editingId = null;
    this.editBudget = 0;
  }

  saveEdit(policy: any) {
    if (this.editBudget <= 0) {
      alert('Budget must be greater than 0');
      return;
    }

    this.saving = true;
    this.authService
      .updatePolicy(policy.travelPolicyId, { maxBudget: this.editBudget })
      .subscribe({
        next: () => {
          this.editingId = null;
          this.saving = false;
          this.loadPolicies();
        },
        error: () => {
          alert('Failed to update policy');
          this.saving = false;
        },
      });
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getDeptIcon(name: string): string {
    const map: any = {
      engineering: '⚙️',
      hr: '👥',
      marketing: '📢',
      finance: '💰',
      sales: '📈',
      operations: '🔧',
      it: '💻',
      design: '🎨',
      legal: '⚖️',
      support: '🎧',
    };
    const key = (name || '').toLowerCase();
    for (const k of Object.keys(map)) {
      if (key.includes(k)) return map[k];
    }
    return '🏢';
  }

  getDeptColor(name: string): string {
    const colors = [
      '#1d4ed8',
      '#0891b2',
      '#059669',
      '#d97706',
      '#7c3aed',
      '#db2777',
      '#ea580c',
      '#0284c7',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }
}
