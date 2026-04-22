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
import { AuthService } from '../../services/auth.service';

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

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
    ]),
  });

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const user = this.authService.login(email!, password!);
      if (user) {
        // alert('Login Successful');

        if (user.role === 'employee') {
          this.router.navigate(['/employee']);
        } else if (user.role === 'manager') {
          this.router.navigate(['/manager']);
        } else if (user.role === 'finance') {
          this.router.navigate(['/finance']);
        }
      } else {
        alert('Invalid Credentials');
      }
    }
  }
}
