import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AccountService } from '../core/services/account.service';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.scss']
})
export class SendMoneyComponent implements OnInit {
  sendMoneyForm!: FormGroup;
  loading = false;
  currentBalance = 0;
  hidePin = true;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentBalance();
  }

  initForm(): void {
    this.sendMoneyForm = this.fb.group({
      toAccountNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{16}$/),
        Validators.minLength(16),
        Validators.maxLength(16)
      ]],
      amount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      mpin: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]]
    });
  }

  loadCurrentBalance(): void {
    this.accountService.getMyAccount().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentBalance = response.data.balance;
        }
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.sendMoneyForm.invalid) {
      this.markFormGroupTouched(this.sendMoneyForm);
      return;
    }

    const amount = this.sendMoneyForm.get('amount')?.value;
    if (amount > this.currentBalance) {
      this.snackBar.open('Insufficient balance!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    const request = this.sendMoneyForm.value;

    this.accountService.sendMoney(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.snackBar.open('Money sent successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to send money. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.sendMoneyForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('pattern')) {
      return `Invalid ${this.getFieldLabel(fieldName)} format`;
    }
    if (field?.hasError('min')) {
      return `Amount must be at least ₹1`;
    }
    if (field?.hasError('max')) {
      return `Amount cannot exceed ₹1,00,000`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} is too short`;
    }
    if (field?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} is too long`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      toAccountNumber: 'Account number',
      amount: 'Amount',
      description: 'Description',
      mpin: 'MPIN'
    };
    return labels[fieldName] || fieldName;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}