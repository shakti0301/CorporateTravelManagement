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
import { RequestService } from '../../../services/request/request.service';
import { Router } from '@angular/router';

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

const noPastDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const dateValue = control.value;

  if (!dateValue) {
    return null;
  }

  const selectedDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate < today ? { pastDateNotAllowed: true } : null;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

@Component({
  selector: 'app-travel-request',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, CommonModule],
  templateUrl: './travel-request.component.html',
  styleUrl: './travel-request.component.css',
})
export class TravelRequestComponent {
  constructor(
    private requestService: RequestService,
    private router: Router,
  ) {}
  submitted = false;

  requestForm = new FormGroup(
    {
      source: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/),
      ]),
      destination: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/),
      ]),
      fromDate: new FormControl('', [Validators.required, noPastDateValidator]),
      toDate: new FormControl('', [Validators.required, noPastDateValidator]),
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
      pmEmail: new FormControl(''),
    },
    { validators: travelDateRangeValidator },
  );

  get source() {
    return this.requestForm.get('source');
  }

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

  get today() {
    return formatDateForInput(new Date());
  }

  get pmEmail() {
    return this.requestForm.get('pmEmail');
  }

  get fromDateMin() {
    const fromDateValue = this.fromDate?.value;

    if (!fromDateValue) {
      return this.today;
    }

    return fromDateValue > this.today ? fromDateValue : this.today;
  }

  //To list of PMs for dropdown

  projectManagers: any[] = [];
  ngOnInit() {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    this.projectManagers = allUsers.filter(
      (u: any) => u.role === 'projectmanager',
    );
  }

  hasDateValidationErrors() {
    return Boolean(
      this.fromDate?.hasError('pastDateNotAllowed') ||
      this.toDate?.hasError('pastDateNotAllowed') ||
      this.requestForm.hasError('dateRangeInvalid'),
    );
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.requestService.createRequest(this.requestForm.value, false);

      alert('Travel request submitted successfully!');
      this.requestForm.reset();
      this.router.navigate(['/employee/myrequests']);
    }
  }
  saveDraft() {
    if (this.hasDateValidationErrors()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.requestService.createRequest(this.requestForm.value, true);

    alert('Travel request saved as draft!');
    this.requestForm.reset();
    this.router.navigate(['/employee/myrequests']);
  }
}
