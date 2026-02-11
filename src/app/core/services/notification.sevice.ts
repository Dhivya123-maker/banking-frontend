import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface Notification {
  notificationId: number;
  notificationType: string;
  title: string;
  message: string;
  referenceId: number;
  referenceType: string;
  isRead: boolean;
  priority: string;
  actionUrl: string;
  icon: string;
  createdAt: string;
  readAt: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
}

export interface CreateNotificationRequest {
  notificationType: string;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  priority?: string;
  actionUrl?: string;
  icon?: string;
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
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.loadUnreadCount();
  }

  private getHeaders(): HttpHeaders {
    const token = this.storage.getItem<string>(environment.jwtTokenKey);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Load unread count
  loadUnreadCount(): void {
    this.getNotificationStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadCountSubject.next(response.data.unreadCount);
        }
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  // Get all notifications
  getAllNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/notifications/all`,
      { headers: this.getHeaders() }
    );
  }

  // Get unread notifications
  getUnreadNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/notifications/unread`,
      { headers: this.getHeaders() }
    );
  }

  // Get notifications by type
  getNotificationsByType(type: string): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/notifications/type/${type}`,
      { headers: this.getHeaders() }
    );
  }

  // Get notification statistics
  getNotificationStats(): Observable<ApiResponse<NotificationStats>> {
    return this.http.get<ApiResponse<NotificationStats>>(
      `${this.apiUrl}/notifications/stats`,
      { headers: this.getHeaders() }
    );
  }

  // Get notification by ID
  getNotificationById(notificationId: number): Observable<ApiResponse<Notification>> {
    return this.http.get<ApiResponse<Notification>>(
      `${this.apiUrl}/notifications/${notificationId}`,
      { headers: this.getHeaders() }
    );
  }

  // Mark as read
  markAsRead(notificationId: number): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  // Mark all as read
  markAllAsRead(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this.apiUrl}/notifications/mark-all-read`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/notifications/${notificationId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  // Delete all notifications
  deleteAllNotifications(): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/notifications/clear-all`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  // Create notification (for testing)
  createNotification(request: CreateNotificationRequest): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(
      `${this.apiUrl}/notifications/create`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadUnreadCount())
    );
  }
}