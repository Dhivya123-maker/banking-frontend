import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface MoneyRequest {
  requestId: number;
  requesterId: number;
  requesterName: string;
  requesterMobile: string;
  requesteeId: number;
  requesteeName: string;
  requesteeMobile: string;
  amount: number;
  description: string;
  status: string;
  transactionId?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  requestType: string; // "SENT" or "RECEIVED"
}

export interface CreateMoneyRequestRequest {
  requesteeMobile: string;
  amount: number;
  description: string;
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
export class MoneyRequestService {
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

  createMoneyRequest(request: CreateMoneyRequestRequest): Observable<ApiResponse<MoneyRequest>> {
    return this.http.post<ApiResponse<MoneyRequest>>(
      `${this.apiUrl}/money-requests/create`,
      request,
      { headers: this.getHeaders() }
    );
  }

  getAllMoneyRequests(): Observable<ApiResponse<MoneyRequest[]>> {
    return this.http.get<ApiResponse<MoneyRequest[]>>(
      `${this.apiUrl}/money-requests/all`,
      { headers: this.getHeaders() }
    );
  }

  getPendingRequests(): Observable<ApiResponse<MoneyRequest[]>> {
    return this.http.get<ApiResponse<MoneyRequest[]>>(
      `${this.apiUrl}/money-requests/pending`,
      { headers: this.getHeaders() }
    );
  }

  acceptMoneyRequest(requestId: number, mpin: string): Observable<ApiResponse<MoneyRequest>> {
    return this.http.post<ApiResponse<MoneyRequest>>(
      `${this.apiUrl}/money-requests/${requestId}/accept`,
      { mpin },
      { headers: this.getHeaders() }
    );
  }

  rejectMoneyRequest(requestId: number): Observable<ApiResponse<MoneyRequest>> {
    return this.http.post<ApiResponse<MoneyRequest>>(
      `${this.apiUrl}/money-requests/${requestId}/reject`,
      null,
      { headers: this.getHeaders() }
    );
  }

  cancelMoneyRequest(requestId: number): Observable<ApiResponse<MoneyRequest>> {
    return this.http.post<ApiResponse<MoneyRequest>>(
      `${this.apiUrl}/money-requests/${requestId}/cancel`,
      null,
      { headers: this.getHeaders() }
    );
  }
}