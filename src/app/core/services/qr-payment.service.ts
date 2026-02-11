import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface QRPayment {
  qrPaymentId: number;
  qrCode: string;
  qrType: string;
  amount: number;
  merchantName: string;
  merchantUpi: string;
  accountNumber: string;
  ifscCode: string;
  transactionId: number;
  paymentStatus: string;
  qrData: string;
  isExpired: boolean;
  expiresAt: string;
  createdAt: string;
  completedAt: string;
}

export interface GenerateQRRequest {
  qrType: string;
  amount?: number;
  merchantName?: string;
  merchantUpi?: string;
  expiryMinutes?: number;
}

export interface ScanQRRequest {
  qrCode: string;
}

export interface PayQRRequest {
  qrCode: string;
  amount?: number;
  mpin: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QrPaymentService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storage.getItem<string>(environment.jwtTokenKey);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Generate QR code
  generateQRCode(request: GenerateQRRequest): Observable<ApiResponse<QRPayment>> {
    return this.http.post<ApiResponse<QRPayment>>(
      `${this.apiUrl}/qr-payments/generate`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Scan QR code
  scanQRCode(request: ScanQRRequest): Observable<ApiResponse<QRPayment>> {
    return this.http.post<ApiResponse<QRPayment>>(
      `${this.apiUrl}/qr-payments/scan`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Pay via QR code
  payViaQRCode(request: PayQRRequest): Observable<ApiResponse<QRPayment>> {
    return this.http.post<ApiResponse<QRPayment>>(
      `${this.apiUrl}/qr-payments/pay`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Get QR payment history
  getQRPaymentHistory(): Observable<ApiResponse<QRPayment[]>> {
    return this.http.get<ApiResponse<QRPayment[]>>(
      `${this.apiUrl}/qr-payments/history`,
      { headers: this.getHeaders() }
    );
  }

  // Get active QR codes
  getActiveQRCodes(): Observable<ApiResponse<QRPayment[]>> {
    return this.http.get<ApiResponse<QRPayment[]>>(
      `${this.apiUrl}/qr-payments/active`,
      { headers: this.getHeaders() }
    );
  }

  // Get QR payment by ID
  getQRPaymentById(qrPaymentId: number): Observable<ApiResponse<QRPayment>> {
    return this.http.get<ApiResponse<QRPayment>>(
      `${this.apiUrl}/qr-payments/${qrPaymentId}`,
      { headers: this.getHeaders() }
    );
  }
}