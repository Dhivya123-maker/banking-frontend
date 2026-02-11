import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BillPaymentService, Biller, SavedBiller, BillPayment } from '../../core/services/bill-payment.service';

@Component({
  selector: 'app-bill-payments',
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
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule
  ],
  templateUrl: './bill-payments.component.html',
  styleUrls: ['./bill-payments.component.scss']
})
export class BillPaymentsComponent implements OnInit {
  payBillForm!: FormGroup;
  billers: Biller[] = [];
  savedBillers: SavedBiller[] = [];
  paymentHistory: BillPayment[] = [];
  filteredBillers: Biller[] = [];
  selectedBiller: Biller | null = null;
  loading = false;
  submitting = false;
  selectedTabIndex = 0;

  categories = [
    { value: 'ALL', label: 'All', icon: 'apps' },
    { value: 'ELECTRICITY', label: 'Electricity', icon: 'electric_bolt' },
    { value: 'WATER', label: 'Water', icon: 'water_drop' },
    { value: 'GAS', label: 'Gas', icon: 'local_fire_department' },
    { value: 'MOBILE_PREPAID', label: 'Mobile', icon: 'phone_android' },
    { value: 'DTH', label: 'DTH', icon: 'tv' },
    { value: 'BROADBAND', label: 'Broadband', icon: 'wifi' }
  ];

  selectedCategory = 'ALL';
  searchTerm = '';

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years: number[] = [];

  constructor(
    private fb: FormBuilder,
    private billPaymentService: BillPaymentService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Generate years (current year and next year)
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadBillers();
    this.loadSavedBillers();
    this.loadPaymentHistory();
  }

  initForm(): void {
    this.payBillForm = this.fb.group({
      billerId: ['', Validators.required],
      consumerNumber: ['', [Validators.required, Validators.minLength(5)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      billMonth: [''],
      billYear: [new Date().getFullYear()],
      mpin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      saveBiller: [false],
      nickname: ['']
    });
  }

  loadBillers(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.billPaymentService.getAllBillers().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.billers = response.data;
          this.filteredBillers = this.billers;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading billers:', error);
        this.snackBar.open('Failed to load billers', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  loadSavedBillers(): void {
    this.billPaymentService.getSavedBillers().subscribe({
      next: (response) => {
        if (response.success) {
          this.savedBillers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading saved billers:', error);
      }
    });
  }

  loadPaymentHistory(): void {
    this.billPaymentService.getPaymentHistory().subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentHistory = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading payment history:', error);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'ALL') {
      this.filteredBillers = this.billers;
    } else {
      this.filteredBillers = this.billers.filter(b => b.billerCategory === category);
    }
  }

  searchBillers(): void {
    if (this.searchTerm.trim().length < 2) {
      this.filteredBillers = this.billers;
      return;
    }

    this.billPaymentService.searchBillers(this.searchTerm).subscribe({
      next: (response) => {
        if (response.success) {
          this.filteredBillers = response.data;
        }
      },
      error: (error) => {
        console.error('Error searching billers:', error);
      }
    });
  }

  selectBiller(biller: Biller): void {
    this.selectedBiller = biller;
    this.payBillForm.patchValue({
      billerId: biller.billerId
    });
    this.selectedTabIndex = 1; // Switch to payment form tab
  }

  selectSavedBiller(savedBiller: SavedBiller): void {
    const biller = this.billers.find(b => b.billerId === savedBiller.billerId);
    if (biller) {
      this.selectedBiller = biller;
      this.payBillForm.patchValue({
        billerId: savedBiller.billerId,
        consumerNumber: savedBiller.consumerNumber,
        nickname: savedBiller.nickname
      });
      this.selectedTabIndex = 1;
    }
  }

  removeSavedBiller(savedBiller: SavedBiller): void {
    if (!confirm(`Remove ${savedBiller.nickname || savedBiller.billerName}?`)) {
      return;
    }

    this.billPaymentService.removeSavedBiller(savedBiller.savedBillerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Biller removed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadSavedBillers();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to remove biller';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  payBill(): void {
    if (this.payBillForm.invalid) {
      this.markFormGroupTouched(this.payBillForm);
      return;
    }

    if (!this.selectedBiller) {
      this.snackBar.open('Please select a biller', 'Close', { duration: 3000 });
      return;
    }

    const amount = this.payBillForm.value.amount;
    if (amount < this.selectedBiller.minAmount || amount > this.selectedBiller.maxAmount) {
      this.snackBar.open(
        `Amount must be between ₹${this.selectedBiller.minAmount} and ₹${this.selectedBiller.maxAmount}`,
        'Close',
        { duration: 5000 }
      );
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    this.billPaymentService.payBill(this.payBillForm.value).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.snackBar.open('Bill payment successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm();
          this.loadPaymentHistory();
          this.loadSavedBillers();
          this.selectedTabIndex = 2; // Switch to history tab
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Payment failed';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.payBillForm.reset({
      billMonth: '',
      billYear: new Date().getFullYear(),
      saveBiller: false
    });
    this.selectedBiller = null;
    this.selectedTabIndex = 0;
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.icon : 'receipt';
  }

  getPaymentStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
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