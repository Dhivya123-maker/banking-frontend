import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService, Transaction } from '../../core/services/account.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  filterForm!: FormGroup;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;
  displayedColumns: string[] = ['date', 'type', 'description', 'reference', 'amount', 'status'];

  transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'INTEREST_CREDIT', label: 'Interest Credit' },
    { value: 'FEE', label: 'Fee' }
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' }
  ];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTransactions();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      type: [''],
      status: [''],
      startDate: [''],
      endDate: ['']
    });
  }

 loadTransactions(): void {
  this.loading = true;
  this.cdr.detectChanges();  // ← Add this
  
  this.accountService.getAllTransactions().subscribe({
    next: (response) => {
      console.log('Load response:', response);  // Debug
      this.loading = false;
      if (response.success) {
        this.transactions = response.data;
        this.filteredTransactions = response.data;
        console.log('All transactions:', this.transactions);  // Debug
      }
      this.cdr.detectChanges();  // ← Add this
    },
    error: (error) => {
      this.loading = false;
      console.error('Error loading transactions:', error);
      this.cdr.detectChanges();  // ← Add this
    }
  });
}

  applyFilters(): void {
  const filters = this.filterForm.value;
  
  const params: any = {};
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.startDate) params.startDate = this.formatDate(filters.startDate);
  if (filters.endDate) params.endDate = this.formatDate(filters.endDate);

  this.loading = true;
  this.cdr.detectChanges();  // ← Add this
  
  this.accountService.getAllTransactions(params).subscribe({
    next: (response) => {
      console.log('Filter response:', response);  // Debug
      this.loading = false;
      if (response.success) {
        this.filteredTransactions = response.data;
        console.log('Filtered transactions:', this.filteredTransactions);  // Debug
      }
      this.cdr.detectChanges();  // ← Add this
    },
    error: (error) => {
      this.loading = false;
      console.error('Error filtering transactions:', error);
      this.cdr.detectChanges();  // ← Add this
    }
  });
}

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredTransactions = this.transactions;
    this.loadTransactions();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTypeLabel(type: string): string {
    const typeObj = this.transactionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getTypeClass(type: string): string {
    if (['DEPOSIT', 'TRANSFER_IN', 'INTEREST_CREDIT'].includes(type)) {
      return 'credit';
    } else if (['WITHDRAWAL', 'TRANSFER_OUT', 'FEE'].includes(type)) {
      return 'debit';
    }
    return '';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  isCredit(type: string): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'INTEREST_CREDIT'].includes(type);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}