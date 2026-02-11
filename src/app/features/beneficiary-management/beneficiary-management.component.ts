import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BeneficiaryService, Beneficiary, AddBeneficiaryRequest } from '../../core/services/beneficiary.service';

@Component({
  selector: 'app-beneficiary-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './beneficiary-management.component.html',
  styleUrls: ['./beneficiary-management.component.scss']
})
export class BeneficiaryManagementComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  filteredBeneficiaries: Beneficiary[] = [];
  favoriteBeneficiaries: Beneficiary[] = [];
  frequentlyUsed: Beneficiary[] = [];
  
  loading = false;
  showAddForm = false;
  editingBeneficiary: Beneficiary | null = null;
  
  addBeneficiaryForm!: FormGroup;
  editBeneficiaryForm!: FormGroup;
  searchTerm = '';

  selectedFilter: 'all' | 'favorites' | 'frequent' = 'all';

  banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'IndusInd Bank'
  ];

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadBeneficiaries();
    this.loadFavorites();
    this.loadFrequentlyUsed();
  }

  initForms(): void {
    this.addBeneficiaryForm = this.fb.group({
      beneficiaryName: ['', [Validators.required, Validators.minLength(3)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,18}$/)]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      bankName: [''],
      branchName: [''],
      mobileNumber: ['', Validators.pattern(/^[6-9][0-9]{9}$/)],
      email: ['', Validators.email],
      nickname: [''],
      beneficiaryType: ['BANK']
    });

    this.editBeneficiaryForm = this.fb.group({
      beneficiaryName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', Validators.pattern(/^[6-9][0-9]{9}$/)],
      email: ['', Validators.email],
      nickname: ['']
    });
  }

  loadBeneficiaries(): void {
    this.loading = true;
    this.beneficiaryService.getAllBeneficiaries().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.beneficiaries = response.data;
          this.applyFilter();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading beneficiaries:', error);
        this.snackBar.open('Failed to load beneficiaries', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadFavorites(): void {
    this.beneficiaryService.getFavoriteBeneficiaries().subscribe({
      next: (response) => {
        if (response.success) {
          this.favoriteBeneficiaries = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
      }
    });
  }

  loadFrequentlyUsed(): void {
    this.beneficiaryService.getFrequentlyUsed().subscribe({
      next: (response) => {
        if (response.success) {
          this.frequentlyUsed = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading frequently used:', error);
      }
    });
  }

  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredBeneficiaries = this.beneficiaries;
    } else if (this.selectedFilter === 'favorites') {
      this.filteredBeneficiaries = this.beneficiaries.filter(b => b.isFavorite);
    } else if (this.selectedFilter === 'frequent') {
      this.filteredBeneficiaries = this.beneficiaries
        .filter(b => b.totalTransactions > 0)
        .sort((a, b) => b.totalTransactions - a.totalTransactions)
        .slice(0, 10);
    }
  }

  searchBeneficiaries(): void {
    if (this.searchTerm.trim().length < 2) {
      this.applyFilter();
      return;
    }

    this.beneficiaryService.searchBeneficiaries(this.searchTerm).subscribe({
      next: (response) => {
        if (response.success) {
          this.filteredBeneficiaries = response.data;
        }
      },
      error: (error) => {
        console.error('Error searching beneficiaries:', error);
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addBeneficiaryForm.reset({ beneficiaryType: 'BANK' });
    }
  }

  addBeneficiary(): void {
    if (this.addBeneficiaryForm.invalid) {
      this.markFormGroupTouched(this.addBeneficiaryForm);
      return;
    }

    this.loading = true;
    const request: AddBeneficiaryRequest = this.addBeneficiaryForm.value;

    this.beneficiaryService.addBeneficiary(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.snackBar.open('Beneficiary added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.toggleAddForm();
          this.loadBeneficiaries();
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to add beneficiary';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editBeneficiary(beneficiary: Beneficiary): void {
    this.editingBeneficiary = beneficiary;
    this.editBeneficiaryForm.patchValue({
      beneficiaryName: beneficiary.beneficiaryName,
      mobileNumber: beneficiary.mobileNumber,
      email: beneficiary.email,
      nickname: beneficiary.nickname
    });
  }

  cancelEdit(): void {
    this.editingBeneficiary = null;
    this.editBeneficiaryForm.reset();
  }

  updateBeneficiary(): void {
    if (this.editBeneficiaryForm.invalid || !this.editingBeneficiary) {
      return;
    }

    this.loading = true;
    this.beneficiaryService.updateBeneficiary(
      this.editingBeneficiary.beneficiaryId,
      this.editBeneficiaryForm.value
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.snackBar.open('Beneficiary updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.cancelEdit();
          this.loadBeneficiaries();
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to update beneficiary';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteBeneficiary(beneficiary: Beneficiary): void {
    if (!confirm(`Delete ${beneficiary.beneficiaryName}?`)) {
      return;
    }

    this.beneficiaryService.deleteBeneficiary(beneficiary.beneficiaryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Beneficiary deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadBeneficiaries();
          this.loadFavorites();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to delete beneficiary';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleFavorite(beneficiary: Beneficiary, event: Event): void {
    event.stopPropagation();
    
    this.beneficiaryService.toggleFavorite(beneficiary.beneficiaryId).subscribe({
      next: (response) => {
        if (response.success) {
          beneficiary.isFavorite = !beneficiary.isFavorite;
          this.loadFavorites();
          const message = beneficiary.isFavorite ? 'Added to favorites' : 'Removed from favorites';
          this.snackBar.open(message, 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to update favorite';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  sendMoneyToBeneficiary(beneficiary: Beneficiary): void {
    this.router.navigate(['/send-money'], {
      state: {
        beneficiary: {
          accountNumber: beneficiary.accountNumber,
          name: beneficiary.beneficiaryName,
          ifscCode: beneficiary.ifscCode,
          bankName: beneficiary.bankName
        }
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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