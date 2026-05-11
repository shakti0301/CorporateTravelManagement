import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submitted = false;
  authErrorMessage = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    this.submitted = true;
    this.authErrorMessage = '';

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const normalizedEmail = email!.trim().toLowerCase();
      const user = this.authService.login(normalizedEmail, password!);
      if (user) {
        const path = this.authService.getRedirectPath(user.role);
        this.router.navigate([path]);
      } else {
        this.authErrorMessage = 'Invalid email or password';
        this.loginForm.patchValue({ password: '' });
        this.submitted = false;
      }
    }
  }
}
