import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { QRCodeComponent } from 'angularx-qrcode';
import { QrPaymentService, QRPayment, GenerateQRRequest } from '../../core/services/qr-payment.service';

@Component({
  selector: 'app-qr-payments',
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
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    QRCodeComponent
  ],
  templateUrl: './qr-payments.component.html',
  styleUrls: ['./qr-payments.component.scss']
})
export class QrPaymentsComponent implements OnInit {
  @ViewChild('qrScanner') qrScanner!: ElementRef;

  generateQRForm!: FormGroup;
  scanQRForm!: FormGroup;
  payQRForm!: FormGroup;

  generatedQR: QRPayment | null = null;
  scannedQR: QRPayment | null = null;
  qrHistory: QRPayment[] = [];
  activeQRCodes: QRPayment[] = [];

  loading = false;
  submitting = false;
  selectedTabIndex = 0;

  qrTypes = [
    { value: 'RECEIVE', label: 'Receive Money', icon: 'call_received' },
    { value: 'MERCHANT', label: 'Merchant Payment', icon: 'store' }
  ];

  constructor(
    private fb: FormBuilder,
    private qrPaymentService: QrPaymentService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadActiveQRCodes();
    this.loadHistory();
  }

  initForms(): void {
    this.generateQRForm = this.fb.group({
      qrType: ['RECEIVE', Validators.required],
      amount: ['', [Validators.min(1)]],
      merchantName: [''],
      expiryMinutes: [30, [Validators.required, Validators.min(5), Validators.max(1440)]]
    });

    this.scanQRForm = this.fb.group({
      qrCode: ['', Validators.required]
    });

    this.payQRForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      mpin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  loadActiveQRCodes(): void {
    this.qrPaymentService.getActiveQRCodes().subscribe({
      next: (response) => {
        if (response.success) {
          this.activeQRCodes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading active QR codes:', error);
      }
    });
  }

  loadHistory(): void {
    this.qrPaymentService.getQRPaymentHistory().subscribe({
      next: (response) => {
        if (response.success) {
          this.qrHistory = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading history:', error);
      }
    });
  }

  generateQR(): void {
    if (this.generateQRForm.invalid) {
      this.markFormGroupTouched(this.generateQRForm);
      return;
    }

    this.loading = true;
    const request: GenerateQRRequest = this.generateQRForm.value;

    this.qrPaymentService.generateQRCode(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.generatedQR = response.data;
          this.snackBar.open('QR Code generated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadActiveQRCodes();
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to generate QR code';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  scanQR(): void {
    if (this.scanQRForm.invalid) {
      this.markFormGroupTouched(this.scanQRForm);
      return;
    }

    this.loading = true;
    this.qrPaymentService.scanQRCode(this.scanQRForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.scannedQR = response.data;
          
          // Pre-fill amount if available
          if (this.scannedQR.amount) {
            this.payQRForm.patchValue({
              amount: this.scannedQR.amount
            });
          }

          this.snackBar.open('QR Code scanned successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to scan QR code';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  payQR(): void {
    if (this.payQRForm.invalid || !this.scannedQR) {
      this.markFormGroupTouched(this.payQRForm);
      return;
    }

    this.submitting = true;
    const payRequest = {
      qrCode: this.scannedQR.qrCode,
      amount: this.payQRForm.value.amount,
      mpin: this.payQRForm.value.mpin
    };

    this.qrPaymentService.payViaQRCode(payRequest).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.snackBar.open('Payment successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetScanForm();
          this.loadHistory();
          this.selectedTabIndex = 2; // Switch to history tab
        }
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Payment failed';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resetGenerateForm(): void {
    this.generateQRForm.reset({ qrType: 'RECEIVE', expiryMinutes: 30 });
    this.generatedQR = null;
  }

  resetScanForm(): void {
    this.scanQRForm.reset();
    this.payQRForm.reset();
    this.scannedQR = null;
  }

  downloadQR(): void {
    if (!this.generatedQR) return;

    const qrElement = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (qrElement) {
      const url = qrElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${this.generatedQR.qrCode}.png`;
      link.click();
      
      this.snackBar.open('QR Code downloaded', 'Close', { duration: 2000 });
    }
  }

  shareQR(): void {
    if (!this.generatedQR) return;

    if (navigator.share) {
      navigator.share({
        title: 'Payment QR Code',
        text: `Pay me using this QR code: ${this.generatedQR.qrCode}`,
      }).catch(() => {
        this.copyQRCode();
      });
    } else {
      this.copyQRCode();
    }
  }

  copyQRCode(): void {
    if (!this.generatedQR) return;

    navigator.clipboard.writeText(this.generatedQR.qrCode).then(() => {
      this.snackBar.open('QR Code copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase() : 'pending';
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

  getTimeRemaining(expiresAt: string): string {
    if (!expiresAt) return 'No expiry';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    return `${minutes}m remaining`;
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