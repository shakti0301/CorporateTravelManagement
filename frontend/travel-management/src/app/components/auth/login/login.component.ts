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
import { AuthService } from '../../../services/auth/auth.service';

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
      const loginData = {
        email: this.loginForm.value.email?.trim().toLowerCase(),
        password: this.loginForm.value.password,
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log(response);

          // Store JWT Token
          localStorage.setItem('token', response.token);

          // Store Current User
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('role', response.role);
          localStorage.setItem('userName', response.userName);

          // Redirect based on role
          const path = this.authService.getRedirectPath(response.role);

          this.router.navigate([path]);
        },

        error: (error) => {
          console.log(error.error);

          this.authErrorMessage = 'Invalid email or password';

          this.loginForm.patchValue({
            password: '',
          });

          this.submitted = false;
        },
      });
    }
  }
}
