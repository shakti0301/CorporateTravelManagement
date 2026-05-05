import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css',
})
export class RequestDetailsComponent {
  request: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    const requests = JSON.parse(localStorage.getItem('requests') || '[]');

    this.request = requests.find((r: any) => r.id == id);
  }

  viewProof(expense: any) {
    if (!expense.proofFile) return;

    const file = expense.proofFile;

    const reader = new FileReader();

    reader.onload = () => {
      const url = reader.result as string;
      window.open(url, '_blank');
    };

    reader.readAsDataURL(file);
  }
}
