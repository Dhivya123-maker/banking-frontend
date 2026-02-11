import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, Notification, NotificationStats } from '../../core/services/notification.sevice';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  stats: NotificationStats = {
    totalNotifications: 0,
    unreadCount: 0,
    readCount: 0
  };

  loading = false;
  selectedFilter: 'all' | 'unread' | 'read' = 'all';
  selectedType: string = 'ALL';

  notificationTypes = [
    { value: 'ALL', label: 'All', icon: 'notifications' },
    { value: 'TRANSACTION', label: 'Transactions', icon: 'swap_horiz' },
    { value: 'PAYMENT', label: 'Payments', icon: 'payment' },
    { value: 'BILL_PAYMENT', label: 'Bills', icon: 'receipt_long' },
    { value: 'CARD', label: 'Cards', icon: 'credit_card' },
    { value: 'SECURITY', label: 'Security', icon: 'security' },
    { value: 'PROMOTIONAL', label: 'Offers', icon: 'local_offer' },
    { value: 'SYSTEM', label: 'System', icon: 'info' }
  ];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStats();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notifications = response.data;
          this.applyFilters();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading notifications:', error);
        this.snackBar.open('Failed to load notifications', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadStats(): void {
    this.notificationService.getNotificationStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Filter by read/unread
    if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (this.selectedFilter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by type
    if (this.selectedType !== 'ALL') {
      filtered = filtered.filter(n => n.notificationType === this.selectedType);
    }

    this.filteredNotifications = filtered;
  }

  filterByStatus(status: 'all' | 'unread' | 'read'): void {
    this.selectedFilter = status;
    this.applyFilters();
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: (response) => {
        if (response.success) {
          notification.isRead = true;
          this.loadStats();
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error marking as read:', error);
        this.snackBar.open('Failed to mark as read', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  markAllAsRead(): void {
    if (this.stats.unreadCount === 0) {
      this.snackBar.open('No unread notifications', 'Close', { duration: 2000 });
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('All notifications marked as read', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadNotifications();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
        this.snackBar.open('Failed to mark all as read', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (!confirm('Delete this notification?')) {
      return;
    }

    this.notificationService.deleteNotification(notification.notificationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Notification deleted', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.loadNotifications();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.snackBar.open('Failed to delete notification', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  clearAllNotifications(): void {
    if (this.notifications.length === 0) {
      this.snackBar.open('No notifications to clear', 'Close', { duration: 2000 });
      return;
    }

    if (!confirm('Clear all notifications? This cannot be undone.')) {
      return;
    }

    this.notificationService.deleteAllNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('All notifications cleared', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadNotifications();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error clearing notifications:', error);
        this.snackBar.open('Failed to clear notifications', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.isRead) {
      this.markAsRead(notification, new Event('click'));
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  getPriorityClass(priority: string): string {
    return priority ? priority.toLowerCase() : 'normal';
  }

  getTypeIcon(type: string): string {
    const typeObj = this.notificationTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : 'notifications';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}