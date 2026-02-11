import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MoneyRequestService, MoneyRequest } from '../../core/services/money.request.service';

@Component({
  selector: 'app-request-money',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './request-money.component.html',
  styleUrls: ['./request-money.component.scss']
})
export class RequestMoneyComponent implements OnInit {
  requestForm!: FormGroup;
  allRequests: MoneyRequest[] = [];
  sentRequests: MoneyRequest[] = [];
  receivedRequests: MoneyRequest[] = [];
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private moneyRequestService: MoneyRequestService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRequests();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      requesteeMobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      amount: ['', [Validators.required, Validators.min(1), Validators.max(100000)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]]
    });
  }

  loadRequests(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.moneyRequestService.getAllMoneyRequests().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.allRequests = response.data;
          this.sentRequests = response.data.filter(r => r.requestType === 'SENT');
          this.receivedRequests = response.data.filter(r => r.requestType === 'RECEIVED');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading requests:', error);
        this.cdr.detectChanges();
      }
    });
  }

  createRequest(): void {
    if (this.requestForm.invalid) {
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    this.moneyRequestService.createMoneyRequest(this.requestForm.value).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.requestForm.reset();
          Object.keys(this.requestForm.controls).forEach(key => {
            const control = this.requestForm.get(key);
            control?.setErrors(null);
            control?.markAsPristine();
            control?.markAsUntouched();
          });

          this.snackBar.open('Money request sent successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.loadRequests(); // Reload requests
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Failed to create request';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  acceptRequest(request: MoneyRequest): void {
    const mpin = prompt('Enter your MPIN to accept this request:');
    
    if (!mpin) {
      return;
    }

    if (!/^\d{6}$/.test(mpin)) {
      this.snackBar.open('MPIN must be 6 digits', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.moneyRequestService.acceptMoneyRequest(request.requestId, mpin).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Money request accepted and payment completed!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadRequests();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to accept request';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  rejectRequest(request: MoneyRequest): void {
    if (!confirm('Are you sure you want to reject this money request?')) {
      return;
    }

    this.moneyRequestService.rejectMoneyRequest(request.requestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Money request rejected', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadRequests();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to reject request';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancelRequest(request: MoneyRequest): void {
    if (!confirm('Are you sure you want to cancel this money request?')) {
      return;
    }

    this.moneyRequestService.cancelMoneyRequest(request.requestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Money request cancelled', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadRequests();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to cancel request';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
}