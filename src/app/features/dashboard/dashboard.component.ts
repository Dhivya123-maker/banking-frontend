import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { AccountService, AccountInfo, Transaction } from '../../core/services/account.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any;
  account: AccountInfo | null = null;
  recentTransactions: Transaction[] = [];
  isSidenavOpen = true;
  loading = false;

  quickActions = [
    { icon: 'send', label: 'Send Money', color: 'primary', action: 'send' },
    { icon: 'call_received', label: 'Request Money', color: 'accent', action: 'request' },
    { icon: 'account_balance', label: 'Add Money', color: 'warn', action: 'add' },
    { icon: 'history', label: 'Transactions', color: 'primary', action: 'transactions' }
  ];

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
     private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadUserData();
    this.loadAccountData();
    this.loadRecentTransactions();
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.user = currentUser;
    }
  }

loadAccountData(): void {  
    this.loading = true
  this.accountService.getMyAccount().subscribe({
    next: (response) => {
      console.log('Account response:', response);  // Debug log
      if (response.success) {
        this.account = response.data;
        console.log('Account loaded:', this.account);  // Debug log
      }
      this.loading = false;  // Stop loading
    this.cdr.detectChanges();  

    },
    error: (error) => {
      console.error('Error loading account:', error);
      this.loading = false;  // Stop loading even on error
        this.cdr.detectChanges();  

    }
  });
}

  loadRecentTransactions(): void {
    this.accountService.getRecentTransactions().subscribe({
      next: (response) => {
        if (response.success) {
          this.recentTransactions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

onQuickAction(action: string): void {
  switch (action) {
    case 'send':
      this.router.navigate(['/send-money']);
      break;
    case 'request':
      this.router.navigate(['/request-money']);
      break;
    case 'cards':
      this.router.navigate(['/cards']);
      break;
    case 'bills':
      this.router.navigate(['/bill-payments']);
      break;
    case 'transactions':
      this.router.navigate(['/transactions']);
      break;
    case 'statement':
      this.router.navigate(['/account-statement']);
      break;
    case 'profile':
      this.router.navigate(['/profile']);
      break;
  }
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
      year: 'numeric'
    }).format(date);
  }

  getTransactionIcon(type: string): string {
    switch(type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
      case 'INTEREST_CREDIT':
        return 'arrow_downward';
      case 'WITHDRAWAL':
      case 'TRANSFER_OUT':
      case 'FEE':
        return 'arrow_upward';
      default:
        return 'sync_alt';
    }
  }

  getTransactionClass(type: string): string {
    switch(type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
      case 'INTEREST_CREDIT':
        return 'credit';
      case 'WITHDRAWAL':
      case 'TRANSFER_OUT':
      case 'FEE':
        return 'debit';
      default:
        return '';
    }
  }

  isCredit(type: string): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'INTEREST_CREDIT'].includes(type);
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  navigateToProfile(): void {
  this.router.navigate(['/profile']);
}
}