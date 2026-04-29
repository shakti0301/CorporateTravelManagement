import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
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

const ALLOWED_CATEGORIES = [
  'Food',
  'Travel',
  'Accommodation',
  'Transport',
  'Other',
];

const dateRangeValidator = (minDate: string, maxDate: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const min = new Date(minDate);
    const max = new Date(maxDate);

    if (selectedDate < min || selectedDate > max) {
      return { dateOutOfRange: { min: minDate, max: maxDate } };
    }

    return null;
  };
};

const amountValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = Number(control.value);

  if (!control.value) {
    return null;
  }

  if (isNaN(value)) {
    return { invalidAmount: true };
  }

  if (value <= 0) {
    return { amountMustBePositive: true };
  }

  if (value > 100000) {
    return { amountTooHigh: true };
  }

  return null;
};

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent implements OnInit {
  requestId: any;
  expenses: any[] = [];
  currentRequest: any = null;
  showModal: boolean = false;
  fileError: string = '';
  submitted: boolean = false;
  categories = ALLOWED_CATEGORIES;

  expenseForm: FormGroup = new FormGroup({});
  fileInput: File | null = null;

  constructor(private route: ActivatedRoute) {
    this.requestId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.loadCurrentRequest();
    this.initializeForm();
  }

  loadCurrentRequest() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    this.currentRequest = requests.find((r: any) => r.id == this.requestId);

    if (!this.currentRequest) {
      alert('Travel request not found!');
      return;
    }

    // Load existing expenses if any
    if (this.currentRequest.expenses) {
      this.expenses = [...this.currentRequest.expenses];
    }
  }

  initializeForm() {
    if (!this.currentRequest) return;

    this.expenseForm = new FormGroup({
      category: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      amount: new FormControl('', [Validators.required, amountValidator]),
      date: new FormControl('', [
        Validators.required,
        dateRangeValidator(
          this.currentRequest.fromDate,
          this.currentRequest.toDate,
        ),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200),
      ]),
    });
  }

  get category() {
    return this.expenseForm.get('category');
  }

  get amount() {
    return this.expenseForm.get('amount');
  }

  get date() {
    return this.expenseForm.get('date');
  }

  get description() {
    return this.expenseForm.get('description');
  }

  get minDate(): string {
    return this.currentRequest?.fromDate || '';
  }

  get maxDate(): string {
    return this.currentRequest?.toDate || '';
  }

  openModal() {
    this.showModal = true;
    this.submitted = false;
    this.expenseForm.reset();
    this.fileInput = null;
    this.fileError = '';
  }

  closeModal() {
    this.showModal = false;
    this.fileError = '';
    this.fileInput = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileError = '';

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Invalid file type. Only JPG, PNG, and PDF are allowed.';
      event.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      this.fileError = 'File size exceeds 2MB limit.';
      event.target.value = '';
      return;
    }

    this.fileInput = file;
  }

  addExpense() {
    this.submitted = true;

    if (!this.expenseForm.valid) {
      return;
    }

    const formData = this.expenseForm.value;

    const newExpense = {
      ...formData,
      id: Date.now(),
      proof: this.fileInput ? this.fileInput.name : '',
      proofFile: this.fileInput,
    };

    this.expenses.push(newExpense);
    this.closeModal();
    this.submitted = false;
  }

  removeExpense(index: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses.splice(index, 1);
    }
  }

  getTotal(): number {
    return this.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  getRemaining(): number {
    if (!this.currentRequest) {
      return 0;
    }

    const approved = Number(this.currentRequest.cost || 0);
    const used = this.getTotal();

    return approved - used;
  }

  isOverBudget(): boolean {
    return this.getRemaining() < 0;
  }

  submitExpenses() {
    if (this.expenses.length === 0) {
      alert('Please add at least one expense before submitting.');
      return;
    }

    if (this.isOverBudget()) {
      alert(
        'Total expenses exceed the approved amount. Please reduce expenses.',
      );
      return;
    }

    let requests = JSON.parse(localStorage.getItem('requests') || '[]');

    requests = requests.map((r: any) => {
      if (r.id == this.requestId) {
        const totalExpense = this.getTotal();
        const approvedAmount = Number(r.cost || 0);
        const remainingAmount = approvedAmount - totalExpense;

        return {
          ...r,
          expenses: this.expenses,
          expenseSubmitted: true,
          totalExpense: totalExpense,
          remainingAmount: remainingAmount,

          reimbursementStatus: 'pending',
          reimbursementRemark: '',
        };
      }
      return r;
    });

    localStorage.setItem('requests', JSON.stringify(requests));
    alert('Expenses submitted to Finance successfully!');
    this.expenses = [];
  }
}
