import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss']
})
export class AccountStatementComponent implements OnInit {
  statementForm!: FormGroup;
  loading = false;
  maxDate = new Date();
  minDate = new Date(2020, 0, 1); // Jan 1, 2020

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar,
      private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.statementForm = this.fb.group({
      startDate: [firstDayOfMonth, Validators.required],
      endDate: [today, Validators.required]
    });
  }

 downloadStatement(): void {
  if (this.statementForm.invalid) {
    return;
  }

  const startDate = this.formatDate(this.statementForm.get('startDate')?.value);
  const endDate = this.formatDate(this.statementForm.get('endDate')?.value);

  // Validate date range
  if (new Date(startDate) > new Date(endDate)) {
    this.snackBar.open('Start date cannot be after end date', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  this.loading = true;
  this.cdr.detectChanges();  // ← Add this

  this.accountService.downloadStatement(startDate, endDate).subscribe({
    next: (blob) => {
      this.loading = false;
      this.cdr.detectChanges();  // ← Add this
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `statement_${startDate}_to_${endDate}.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Statement downloaded successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    },
    error: (error) => {
      this.loading = false;
      this.cdr.detectChanges();  // ← Add this
      
      console.error('Error downloading statement:', error);
      this.snackBar.open('Failed to download statement. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setQuickRange(months: number): void {
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months);

    this.statementForm.patchValue({
      startDate: startDate,
      endDate: today
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}