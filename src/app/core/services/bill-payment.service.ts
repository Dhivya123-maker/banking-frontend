import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface Biller {
  billerId: number;
  billerName: string;
  billerCategory: string;
  billerCode: string;
  billerLogo: string | null;
  convenienceFee: number;
  consumerNumberLabel: string;
  consumerNumberRegex: string;
  isActive: boolean;
  supportsFetchBill: boolean;
  minAmount: number;
  maxAmount: number;
}

export interface SavedBiller {
  savedBillerId: number;
  billerId: number;
  billerName: string;
  billerCategory: string;
  billerCode: string;
  nickname: string;
  consumerNumber: string;
  isAutopayEnabled: boolean;
  minAmount: number;
  maxAmount: number;
  createdAt: string;
}

export interface BillPayment {
  paymentId: number;
  billerId: number;
  billerName: string;
  billerCategory: string;
  consumerNumber: string;
  amount: number;
  paymentStatus: string;
  transactionId: number;
  billMonth: string;
  billYear: number;
  dueDate: string;
  paidDate: string;
  referenceNumber: string;
  confirmationNumber: string;
  paymentMode: string;
  remarks: string;
  createdAt: string;
}

export interface PayBillRequest {
  billerId: number;
  consumerNumber: string;
  amount: number;
  billMonth?: string;
  billYear?: number;
  mpin: string;
  saveBiller?: boolean;
  nickname?: string;
}

export interface SaveBillerRequest {
  billerId: number;
  consumerNumber: string;
  nickname?: string;
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
export class BillPaymentService {
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

  // Get all billers
  getAllBillers(): Observable<ApiResponse<Biller[]>> {
    return this.http.get<ApiResponse<Biller[]>>(
      `${this.apiUrl}/bills/billers`
    );
  }

  // Get billers by category
  getBillersByCategory(category: string): Observable<ApiResponse<Biller[]>> {
    return this.http.get<ApiResponse<Biller[]>>(
      `${this.apiUrl}/bills/billers/category/${category}`
    );
  }

  // Search billers
  searchBillers(searchTerm: string): Observable<ApiResponse<Biller[]>> {
    return this.http.get<ApiResponse<Biller[]>>(
      `${this.apiUrl}/bills/billers/search?q=${searchTerm}`
    );
  }

  // Get saved billers
  getSavedBillers(): Observable<ApiResponse<SavedBiller[]>> {
    return this.http.get<ApiResponse<SavedBiller[]>>(
      `${this.apiUrl}/bills/saved`,
      { headers: this.getHeaders() }
    );
  }

  // Save a biller
  saveBiller(request: SaveBillerRequest): Observable<ApiResponse<SavedBiller>> {
    return this.http.post<ApiResponse<SavedBiller>>(
      `${this.apiUrl}/bills/saved`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Remove saved biller
  removeSavedBiller(savedBillerId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/bills/saved/${savedBillerId}`,
      { headers: this.getHeaders() }
    );
  }

  // Pay bill
  payBill(request: PayBillRequest): Observable<ApiResponse<BillPayment>> {
    return this.http.post<ApiResponse<BillPayment>>(
      `${this.apiUrl}/bills/pay`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Get payment history
  getPaymentHistory(): Observable<ApiResponse<BillPayment[]>> {
    return this.http.get<ApiResponse<BillPayment[]>>(
      `${this.apiUrl}/bills/history`,
      { headers: this.getHeaders() }
    );
  }

  // Get payment by ID
  getPaymentById(paymentId: number): Observable<ApiResponse<BillPayment>> {
    return this.http.get<ApiResponse<BillPayment>>(
      `${this.apiUrl}/bills/history/${paymentId}`,
      { headers: this.getHeaders() }
    );
  }
}