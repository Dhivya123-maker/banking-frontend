import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { 
  ApiResponse, 
  LoginResponse, 
  User 
} from '../models/api-response.model';
import { 
  LoginRequest, 
  RegisterRequest, 
  OTPRequest, 
  OTPVerifyRequest 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.storage.getItem<User>('currentUser')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login
   */
  login(loginRequest: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/auth/login`,
      loginRequest
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register
   */
  register(registerRequest: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auth/register`,
      registerRequest
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Send OTP
   */
  sendOTP(otpRequest: OTPRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auth/send-otp`,
      otpRequest
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verify OTP
   */
  verifyOTP(verifyRequest: OTPVerifyRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auth/verify-otp`,
      verifyRequest
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout
   */
  logout(): void {
    // Call logout API if needed
    // this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();
    
    // Clear local storage
    this.storage.removeItem(environment.jwtTokenKey);
    this.storage.removeItem(environment.jwtRefreshTokenKey);
    this.storage.removeItem('currentUser');
    
    // Update current user
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return this.storage.getItem<string>(environment.jwtTokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getItem<string>(environment.jwtRefreshTokenKey);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(loginResponse: LoginResponse): void {
    // Save tokens
    this.storage.setItem(environment.jwtTokenKey, loginResponse.token);
    this.storage.setItem(environment.jwtRefreshTokenKey, loginResponse.refreshToken);
    
    // Save user
    this.storage.setItem('currentUser', loginResponse.user);
    
    // Update current user subject
    this.currentUserSubject.next(loginResponse.user);
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch {
      return true;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }
    
    console.error('Auth Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}