import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  user: any;
  ngOnInit(): void {
    const data = localStorage.getItem('currentUser');
    this.user = data ? JSON.parse(data) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = '/';
  }
}
