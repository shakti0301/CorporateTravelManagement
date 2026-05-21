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
import { Router } from '@angular/router';
import { ExpenseService } from '../../../../services/expense/expense.service';

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

  isEditMode: boolean = false;
  editIndex: number | null = null;

  get basePath(): string {
    const role = localStorage.getItem('role') || '';
    if (role.toLowerCase() === 'projectmanager') return '/pm';
    if (role.toLowerCase() === 'manager') return '/manager';
    return '/employee';
  }

  expenseForm: FormGroup = new FormGroup({});
  fileInput: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
  ) {
    // Get id from route parameter
    this.requestId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.loadCurrentRequest();
  }

  loadCurrentRequest() {
    this.expenseService.getRequestById(this.requestId).subscribe({
      next: (res: any) => {
        this.currentRequest = {
          ...res,
          id: res.travelRequestId,
          fromDate: res.startDate,
          toDate: res.endDate,
          cost: res.estimatedCost,
        };

        this.expenses = this.expenseService.getExpenseDraft(this.requestId);

        // Block access if travel not fully approved
        if (this.currentRequest.status !== 'Approved') {
          alert(
            'You can submit expenses only after travel request is fully approved.',
          );

          this.router.navigate(['/employee']);
          return;
        }
        this.initializeForm();
      },

      error: (err) => {
        console.log(err);

        alert('Travel request not found');
      },
    });
  }

  initializeForm() {
    if (!this.currentRequest) return;

    this.expenseForm = new FormGroup({
      category: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      otherCategory: new FormControl(''),
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

    // When category is 'Other', make otherCategory required; otherwise clear validators
    const catControl = this.expenseForm.get('category');
    const otherControl = this.expenseForm.get('otherCategory');

    if (catControl && otherControl) {
      catControl.valueChanges.subscribe((val) => {
        if (val === 'Other') {
          otherControl.setValidators([
            Validators.required,
            Validators.minLength(3),
          ]);
        } else {
          otherControl.clearValidators();
        }
        otherControl.updateValueAndValidity({ onlySelf: true });
      });
    }
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

  get otherCategory() {
    return this.expenseForm.get('otherCategory');
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

    if (!this.isEditMode) {
      this.expenseForm.reset();
      this.fileInput = null;
    }

    this.fileError = '';
  }

  closeModal() {
    this.showModal = false;

    this.fileError = '';
    this.fileInput = null;

    this.isEditMode = false;
    this.editIndex = null;
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

  // After addExpense() closes modal, persist immediately
  addExpense() {
    this.submitted = true;

    if (!this.expenseForm.valid) return;

    const formData = this.expenseForm.value;
    const finalCategory =
      formData.category === 'Other' && formData.otherCategory
        ? formData.otherCategory
        : formData.category;

    const newExpense = {
      ...formData,
      category: finalCategory,
      id: Date.now(),
      proof: this.fileInput ? this.fileInput.name : '',
      proofFile: this.fileInput,
    };

    if (this.isEditMode && this.editIndex !== null) {
      this.expenses[this.editIndex] = newExpense;
    } else {
      this.expenses.push(newExpense);
    }

    //  Persist immediately after every change
    this.expenseService.saveExpensesAsDraft(this.requestId, this.expenses);

    this.closeModal();
    this.submitted = false;
  }

  // Persist after delete too
  removeExpense(index: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses.splice(index, 1);
      this.expenseService.saveExpensesAsDraft(this.requestId, this.expenses);
    }
  }

  editExpense(index: number) {
    const exp = this.expenses[index];

    this.expenseForm.patchValue({
      category: this.categories.includes(exp.category) ? exp.category : 'Other',
      otherCategory: this.categories.includes(exp.category) ? '' : exp.category,
      amount: exp.amount,
      date: exp.date,
      description: exp.description,
    });

    this.fileInput = exp.proofFile || null;
    this.editIndex = index;

    this.isEditMode = true;
    this.showModal = true;
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

  // Add inside the class, after isOverBudget()

  getUtilizedPercent(): number {
    if (!this.currentRequest) return 0;
    const budget = Number(this.currentRequest.cost || 0);
    if (budget === 0) return 0;
    const percent = (this.getTotal() / budget) * 100;
    return Math.min(Math.round(percent), 100);
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      Food: '🍽️',
      Travel: '✈️',
      Accommodation: '🛏️',
      Transport: '🚗',
      Lodging: '🛏️',
      Other: '📦',
    };
    return icons[category] || '📋';
  }

  submitExpenses() {
    if (this.expenses.length === 0) {
      alert('Please add at least one expense');
      return;
    }

    if (this.isOverBudget()) {
      alert('Expenses exceed budget');
      return;
    }

    const payload = {
      travelRequestId: Number(this.requestId),

      expenses: this.expenses.map((e: any) => ({
        category: e.category,

        amount: Number(e.amount),

        date: e.date,

        description: e.description,

        proofPath: e.proof || '',
      })),
    };

    this.expenseService.submitExpenses(payload).subscribe({
      next: () => {
        this.expenseService.clearDraft(this.requestId);

        alert('Submitted successfully');

        this.router.navigate([this.basePath + '/myrequests']);
      },

      error: (err) => {
        console.log(err);

        alert('Submission failed');
      },
    });
  }

  goBack() {
    this.router.navigate(['/employee/request-details', this.requestId]);
  }
}
