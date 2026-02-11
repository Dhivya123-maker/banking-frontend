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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CardService, Card } from '../../core/services/card.service';

@Component({
  selector: 'app-cards',
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
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  addCardForm!: FormGroup;
  cards: Card[] = [];
  selectedCard: Card | null = null;
  loading = false;
  submitting = false;
  showAddCardForm = false;

  cardTypes = ['DEBIT', 'CREDIT', 'PREPAID'];
  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    // Generate years (current year + 10 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 15; i++) {
      this.years.push((currentYear + i).toString());
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCards();
  }

  initForm(): void {
    this.addCardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      cardType: ['DEBIT', Validators.required],
      cardHolderName: ['', [Validators.required, Validators.minLength(3)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
      dailyLimit: [50000, [Validators.required, Validators.min(1000)]],
      monthlyLimit: [500000, [Validators.required, Validators.min(10000)]]
    });
  }

  loadCards(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.cardService.getAllCards().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.cards = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading cards:', error);
        this.snackBar.open('Failed to load cards', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddCardForm(): void {
    this.showAddCardForm = !this.showAddCardForm;
    if (!this.showAddCardForm) {
      this.addCardForm.reset({
        cardType: 'DEBIT',
        dailyLimit: 50000,
        monthlyLimit: 500000
      });
    }
  }

  addCard(): void {
    if (this.addCardForm.invalid) {
      this.markFormGroupTouched(this.addCardForm);
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    this.cardService.addCard(this.addCardForm.value).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.snackBar.open('Card added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.toggleAddCardForm();
          this.loadCards();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Failed to add card';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  blockCard(card: Card): void {
    if (!confirm(`Are you sure you want to block card ending in ${this.getLastFourDigits(card.cardNumber)}?`)) {
      return;
    }

    this.cardService.updateCardStatus(card.cardId, 'BLOCKED').subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Card blocked successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCards();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to block card';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  unblockCard(card: Card): void {
    if (!confirm(`Are you sure you want to unblock card ending in ${this.getLastFourDigits(card.cardNumber)}?`)) {
      return;
    }

    this.cardService.updateCardStatus(card.cardId, 'ACTIVE').subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Card unblocked successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCards();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to unblock card';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  setPrimaryCard(card: Card): void {
    if (card.isPrimary) {
      this.snackBar.open('This card is already primary', 'Close', {
        duration: 3000
      });
      return;
    }

    this.cardService.setPrimaryCard(card.cardId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Primary card updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCards();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to set primary card';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleCardSetting(card: Card, setting: string): void {
    const request: any = {};
    
    switch(setting) {
      case 'atm':
        request.atmEnabled = !card.atmEnabled;
        break;
      case 'online':
        request.onlineEnabled = !card.onlineEnabled;
        break;
      case 'contactless':
        request.contactlessEnabled = !card.contactlessEnabled;
        break;
      case 'international':
        request.internationalEnabled = !card.internationalEnabled;
        break;
    }

    this.cardService.updateCardSettings(card.cardId, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Settings updated successfully', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.loadCards();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to update settings';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getCardBrandIcon(brand: string): string {
    switch (brand) {
      case 'VISA': return 'credit_card';
      case 'MASTERCARD': return 'credit_card';
      case 'RUPAY': return 'credit_card';
      default: return 'credit_card';
    }
  }

  getCardTypeIcon(type: string): string {
    switch (type) {
      case 'DEBIT': return 'account_balance';
      case 'CREDIT': return 'credit_score';
      case 'PREPAID': return 'payments';
      default: return 'credit_card';
    }
  }

  getCardStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getLastFourDigits(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '').slice(-4);
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