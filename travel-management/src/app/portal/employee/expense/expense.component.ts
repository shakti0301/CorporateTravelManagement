import { CommonModule } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

const allowedReceiptTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxReceiptSizeInBytes = 2 * 1024 * 1024;

const receiptUploadValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const file = control.value as File | null;

  if (!file) {
    return null;
  }

  if (!allowedReceiptTypes.includes(file.type)) {
    return { invalidType: true };
  }

  if (file.size > maxReceiptSizeInBytes) {
    return { fileTooLarge: true };
  }

  return null;
};

type ExpenseCategory = 'Food' | 'Stay' | 'Transport' | 'Miscellaneous';

interface StoredReceipt {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  readonly expenseCategories: ExpenseCategory[] = [
    'Food',
    'Stay',
    'Transport',
    'Miscellaneous',
  ];
  readonly acceptedReceiptTypes =
    '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';
  readonly maxReceiptSizeInMb = 2;

  requestId: any;
  submitted = false;
  receiptTouched = false;
  receiptError = '';
  receiptFile: StoredReceipt | null = null;

  expenseForm = new FormGroup({
    category: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required, Validators.min(1)]),
    date: new FormControl('', [Validators.required]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(250),
    ]),
    receipt: new FormControl<File | null>(null, [
      Validators.required,
      receiptUploadValidator,
    ]),
  });

  constructor(private route: ActivatedRoute) {
    this.requestId =
      this.route.snapshot.paramMap.get('requestId') ??
      this.route.snapshot.paramMap.get('id');
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

  get receipt() {
    return this.expenseForm.get('receipt');
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error('Unable to read the selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async onReceiptSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.receiptTouched = true;
    this.receiptError = '';
    this.receiptFile = null;

    this.receipt?.setValue(file);
    this.receipt?.markAsTouched();
    this.receipt?.updateValueAndValidity();

    if (!file) {
      return;
    }

    if (!allowedReceiptTypes.includes(file.type)) {
      this.receiptError = 'Use a JPG, PNG, or PDF file for proof.';
      input.value = '';
      this.receipt?.setValue(null);
      return;
    }

    if (file.size > maxReceiptSizeInBytes) {
      this.receiptError = `File must be ${this.maxReceiptSizeInMb} MB or smaller.`;
      input.value = '';
      this.receipt?.setValue(null);
      return;
    }

    try {
      const dataUrl = await this.readFileAsDataUrl(file);
      this.receiptFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      };
    } catch {
      this.receiptError = 'Unable to read the selected file.';
      input.value = '';
      this.receipt?.setValue(null);
      this.receiptFile = null;
    }
  }

  onSubmit(receiptInput: HTMLInputElement) {
    this.submitted = true;

    if (this.expenseForm.invalid || !this.receiptFile) {
      if (!this.receiptFile) {
        this.receiptTouched = true;
        this.receiptError = 'Proof upload is required.';
      }

      return;
    }

    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

    const newExpense = {
      ...this.expenseForm.value,
      requestId: this.requestId,
      receipt: this.receiptFile,
    };
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    alert('Expense added successfully!');
    this.expenseForm.reset();
    this.submitted = false;
    this.receiptTouched = false;
    this.receiptError = '';
    this.receiptFile = null;
    receiptInput.value = '';
  }
}
