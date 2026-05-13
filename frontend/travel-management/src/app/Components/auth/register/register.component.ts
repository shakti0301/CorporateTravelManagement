import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

const passwordStrengthPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submitted = false;
  authErrorMessage = '';

  registerForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z ]+$/),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        Validators.pattern(passwordStrengthPattern),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      // role: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  onSubmit() {
    console.log('Submit');

    this.submitted = true;
    this.authErrorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const registerData = {
      userName: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      // Employee Role
      roleId: 2,
      // .NET Department
      departmentId: 1,
      managerId: null,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log(response);

        alert('Registration Successful');

        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      },

      error: (error) => {
        console.log(error);
        this.authErrorMessage = error?.error?.message || 'Registration failed';
      },
    });
  }
}
