import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface Beneficiary {
  beneficiaryId: number;
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  mobileNumber: string;
  email: string;
  nickname: string;
  isVerified: boolean;
  isFavorite: boolean;
  beneficiaryType: string;
  lastTransactionDate: string;
  totalTransactions: number;
  totalAmount: number;
  createdAt: string;
}

export interface AddBeneficiaryRequest {
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  branchName?: string;
  mobileNumber?: string;
  email?: string;
  nickname?: string;
  beneficiaryType?: string;
}

export interface UpdateBeneficiaryRequest {
  beneficiaryName?: string;
  mobileNumber?: string;
  email?: string;
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
export class BeneficiaryService {
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

  // Get all beneficiaries
  getAllBeneficiaries(): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(
      `${this.apiUrl}/beneficiaries/all`,
      { headers: this.getHeaders() }
    );
  }

  // Get favorite beneficiaries
  getFavoriteBeneficiaries(): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(
      `${this.apiUrl}/beneficiaries/favorites`,
      { headers: this.getHeaders() }
    );
  }

  // Get frequently used beneficiaries
  getFrequentlyUsed(): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(
      `${this.apiUrl}/beneficiaries/frequently-used`,
      { headers: this.getHeaders() }
    );
  }

  // Search beneficiaries
  searchBeneficiaries(searchTerm: string): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(
      `${this.apiUrl}/beneficiaries/search?q=${searchTerm}`,
      { headers: this.getHeaders() }
    );
  }

  // Get beneficiary by ID
  getBeneficiaryById(beneficiaryId: number): Observable<ApiResponse<Beneficiary>> {
    return this.http.get<ApiResponse<Beneficiary>>(
      `${this.apiUrl}/beneficiaries/${beneficiaryId}`,
      { headers: this.getHeaders() }
    );
  }

  // Add beneficiary
  addBeneficiary(request: AddBeneficiaryRequest): Observable<ApiResponse<Beneficiary>> {
    return this.http.post<ApiResponse<Beneficiary>>(
      `${this.apiUrl}/beneficiaries/add`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Update beneficiary
  updateBeneficiary(beneficiaryId: number, request: UpdateBeneficiaryRequest): Observable<ApiResponse<Beneficiary>> {
    return this.http.put<ApiResponse<Beneficiary>>(
      `${this.apiUrl}/beneficiaries/${beneficiaryId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Delete beneficiary
  deleteBeneficiary(beneficiaryId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/beneficiaries/${beneficiaryId}`,
      { headers: this.getHeaders() }
    );
  }

  // Toggle favorite
  toggleFavorite(beneficiaryId: number): Observable<ApiResponse<Beneficiary>> {
    return this.http.put<ApiResponse<Beneficiary>>(
      `${this.apiUrl}/beneficiaries/${beneficiaryId}/toggle-favorite`,
      {},
      { headers: this.getHeaders() }
    );
  }
}