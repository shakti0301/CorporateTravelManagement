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
import { ReimbursementService } from '../../../../services/reimbursement/reimbursement.service';

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

    // Convert dates to YYYY-MM-DD format for proper comparison
    const formatDateString = (dateStr: string): string => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const selectedDateStr = formatDateString(control.value);
    const minDateStr = formatDateString(minDate);
    const maxDateStr = formatDateString(maxDate);

    // Compare as strings in YYYY-MM-DD format (avoids timezone issues)
    if (selectedDateStr < minDateStr || selectedDateStr > maxDateStr) {
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

  expenseForm: FormGroup = new FormGroup({});
  fileInput: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private reimbursementService: ReimbursementService,
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
        if ((this.currentRequest.status || '').toLowerCase() !== 'approved') {
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

  private formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get minDate(): string {
    return this.formatDateForInput(this.currentRequest?.fromDate);
  }

  get maxDate(): string {
    return this.formatDateForInput(this.currentRequest?.toDate);
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

    const formData = new FormData();

    formData.append('travelRequestId', Number(this.requestId).toString());

    this.expenses.forEach((e: any, index: number) => {
      formData.append(`expenses[${index}].category`, e.category);

      formData.append(`expenses[${index}].amount`, e.amount.toString());

      formData.append(`expenses[${index}].date`, e.date);

      formData.append(`expenses[${index}].description`, e.description);

      // important
      if (e.proofFile) {
        formData.append(`expenses[${index}].proofFile`, e.proofFile);
      }
    });

    this.reimbursementService.submitExpenses(formData).subscribe({
      next: (res: any) => {
        this.expenseService.clearDraft(this.requestId);

        alert(res.message);

        this.router.navigate(['/employee']);
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
