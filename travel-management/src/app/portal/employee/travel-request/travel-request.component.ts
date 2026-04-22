import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

const travelDateRangeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const fromDate = control.get('fromDate')?.value;
  const toDate = control.get('toDate')?.value;

  if (!fromDate || !toDate) {
    return null;
  }

  return new Date(fromDate) <= new Date(toDate)
    ? null
    : { dateRangeInvalid: true };
};

@Component({
  selector: 'app-travel-request',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, CommonModule],
  templateUrl: './travel-request.component.html',
  styleUrl: './travel-request.component.css',
})
export class TravelRequestComponent {
  submitted = false;

  requestForm = new FormGroup(
    {
      destination: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/),
      ]),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      purpose: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(250),
      ]),
      cost: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000),
      ]),
    },
    { validators: travelDateRangeValidator },
  );

  get destination() {
    return this.requestForm.get('destination');
  }

  get fromDate() {
    return this.requestForm.get('fromDate');
  }

  get toDate() {
    return this.requestForm.get('toDate');
  }

  get purpose() {
    return this.requestForm.get('purpose');
  }

  get cost() {
    return this.requestForm.get('cost');
  }

  onSubmit() {
    this.submitted = true;

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    if (this.requestForm.valid) {
      console.log('Travel Request Submitted', this.requestForm.value);
    }
  }
}
