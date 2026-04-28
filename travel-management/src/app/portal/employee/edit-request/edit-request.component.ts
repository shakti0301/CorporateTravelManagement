import { Component } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-edit-request',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, CommonModule],
  templateUrl: './edit-request.component.html',
  styleUrl: './edit-request.component.css',
})
export class EditRequestComponent {
  requestId: any;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  requestForm = new FormGroup(
    {
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

  get today() {
    return formatDateForInput(new Date());
  }

  get fromDateMin() {
    const fromDateValue = this.fromDate?.value;

    if (!fromDateValue) {
      return this.today;
    }

    return fromDateValue > this.today ? fromDateValue : this.today;
  }

  hasDateValidationErrors() {
    return Boolean(
      this.fromDate?.hasError('pastDateNotAllowed') ||
      this.toDate?.hasError('pastDateNotAllowed') ||
      this.requestForm.hasError('dateRangeInvalid'),
    );
  }

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const req = requests.find((r: any) => r.id == this.requestId);

    if (!req || !req.isDraft) {
      alert('Editing not allowed');
      this.router.navigate(['/employee']);
      return;
    }

    this.requestForm.patchValue(req);
  }

  updateDraft() {
    if (this.hasDateValidationErrors()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id == this.requestId) {
        return {
          ...r,
          ...this.requestForm.value,
          isDraft: true,
        };
      }
      return r;
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    alert('Draft Updated');
    this.router.navigate(['/employee']);
  }

  submitRequest() {
    if (this.requestForm.valid) {
      let requests = JSON.parse(localStorage.getItem('requests') || '[]');

      requests = requests.map((r: any) => {
        if (r.id == this.requestId) {
          return {
            ...r,
            ...this.requestForm.value,
            isDraft: false,
            managerStatus: 'pending',
            financeStatus: 'not_applicable',
            finalStatus: 'pending',
          };
        }
        return r;
      });

      localStorage.setItem('requests', JSON.stringify(requests));

      alert('Request Submitted');
      this.router.navigate(['/employee']);
    } else {
      this.submitted = true;
      this.requestForm.markAllAsTouched();
    }
  }
}
