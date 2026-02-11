import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SendMoneyComponent } from './features/send-money.component';
import { TransactionsComponent } from './features/transactions/transactions.component';
import { AccountStatementComponent } from './features/account-statement/account-statement.component';
import { ProfileComponent } from './features/profile/profile.component';
import { RequestMoneyComponent } from './features/request-money/request-money.component';
import { CardsComponent } from './features/cards/cards.component';
import { BillPaymentsComponent } from './features/bill-payments/bill-payments.component';
import { BeneficiaryManagementComponent } from './features/beneficiary-management/beneficiary-management.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { QrPaymentsComponent } from './features/qr-payments/qr-payments.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      }
    ]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
   {
    path: 'send-money',
    component: SendMoneyComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
  path: 'account-statement',
  component: AccountStatementComponent
},
{
  path: 'profile',
  component: ProfileComponent
},
{
  path: 'request-money',
  component: RequestMoneyComponent
},
{
  path: 'cards',
  component: CardsComponent
},
{
  path: 'bill-payments',
  component: BillPaymentsComponent
},
{
  path: 'beneficiaries',
  component: BeneficiaryManagementComponent
},
{
  path: 'notifications',
  component: NotificationsComponent
},
{
  path: 'qr-payments',
  component: QrPaymentsComponent
},
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];