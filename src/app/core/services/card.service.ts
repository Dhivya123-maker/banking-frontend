import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface Card {
  cardId: number;
  cardNumber: string; // Masked
  cardType: string; // DEBIT, CREDIT, PREPAID
  cardHolderName: string;
  expiryDate: string; // MM/YY
  cardStatus: string;
  isPrimary: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  atmEnabled: boolean;
  onlineEnabled: boolean;
  contactlessEnabled: boolean;
  internationalEnabled: boolean;
  issuedDate: string;
  lastUsedDate?: string;
  cardBrand: string; // VISA, MASTERCARD, RUPAY
}

export interface AddCardRequest {
  cardNumber: string;
  cardType: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface UpdateCardLimitsRequest {
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface UpdateCardSettingsRequest {
  atmEnabled?: boolean;
  onlineEnabled?: boolean;
  contactlessEnabled?: boolean;
  internationalEnabled?: boolean;
}

export interface CardTransaction {
  cardTxnId: number;
  cardId: number;
  merchantName: string;
  merchantCategory: string;
  transactionType: string;
  amount: number;
  currency: string;
  transactionStatus: string;
  authorizationCode: string;
  merchantCity: string;
  merchantCountry: string;
  transactionMode: string;
  createdAt: string;
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
export class CardService {
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

  getAllCards(): Observable<ApiResponse<Card[]>> {
    return this.http.get<ApiResponse<Card[]>>(
      `${this.apiUrl}/cards/all`,
      { headers: this.getHeaders() }
    );
  }

  getActiveCards(): Observable<ApiResponse<Card[]>> {
    return this.http.get<ApiResponse<Card[]>>(
      `${this.apiUrl}/cards/active`,
      { headers: this.getHeaders() }
    );
  }

  getCardById(cardId: number): Observable<ApiResponse<Card>> {
    return this.http.get<ApiResponse<Card>>(
      `${this.apiUrl}/cards/${cardId}`,
      { headers: this.getHeaders() }
    );
  }

  addCard(request: AddCardRequest): Observable<ApiResponse<Card>> {
    return this.http.post<ApiResponse<Card>>(
      `${this.apiUrl}/cards/add`,
      request,
      { headers: this.getHeaders() }
    );
  }

  updateCardStatus(cardId: number, status: string): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(
      `${this.apiUrl}/cards/${cardId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  setPrimaryCard(cardId: number): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(
      `${this.apiUrl}/cards/${cardId}/set-primary`,
      null,
      { headers: this.getHeaders() }
    );
  }

  updateCardLimits(cardId: number, request: UpdateCardLimitsRequest): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(
      `${this.apiUrl}/cards/${cardId}/limits`,
      request,
      { headers: this.getHeaders() }
    );
  }

  updateCardSettings(cardId: number, request: UpdateCardSettingsRequest): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(
      `${this.apiUrl}/cards/${cardId}/settings`,
      request,
      { headers: this.getHeaders() }
    );
  }

  getCardTransactions(cardId: number): Observable<ApiResponse<CardTransaction[]>> {
    return this.http.get<ApiResponse<CardTransaction[]>>(
      `${this.apiUrl}/cards/${cardId}/transactions`,
      { headers: this.getHeaders() }
    );
  }
}