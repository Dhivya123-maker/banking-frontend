import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface AccountInfo {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
  accountStatus: string;
  ifscCode: string;
  branchName: string;
}

export interface Transaction {
  transactionId: number;
  transactionRef: string;
  transactionType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

export interface SendMoneyRequest {
  toAccountNumber: string;
  amount: number;
  description: string;
  mpin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
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

  getMyAccount(): Observable<ApiResponse<AccountInfo>> {
    return this.http.get<ApiResponse<AccountInfo>>(
      `${this.apiUrl}/accounts/me`,
      { headers: this.getHeaders() }
    );
  }

  getRecentTransactions(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(
      `${this.apiUrl}/accounts/transactions/recent`,
      { headers: this.getHeaders() }
    );
  }

  getAllTransactions(filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<Transaction[]>> {
    let params = new HttpParams();
    
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ApiResponse<Transaction[]>>(
      `${this.apiUrl}/accounts/transactions/all`,
      { headers: this.getHeaders(), params }
    );
  }

  sendMoney(request: SendMoneyRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(
      `${this.apiUrl}/accounts/transactions/send-money`,
      request,
      { headers: this.getHeaders() }
    );
  }

  downloadStatement(startDate: string, endDate: string): Observable<Blob> {
  const params = new HttpParams()
    .set('startDate', startDate)
    .set('endDate', endDate);

  return this.http.get(
    `${this.apiUrl}/accounts/statement/download`,
    {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    }
  );
}
}