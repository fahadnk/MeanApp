// src/app/shared/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  
  // observable containing logged-in user
  currentUser$: Observable<any>;
  
  notifications: any[] = [];
  unreadCount = 0;

  private notificationSub?: Subscription;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    // AuthService now exposes currentUser$
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit(): void {
    // Whenever notifications arrive from server
    this.notificationSub = this.notificationService.notifications$.subscribe(
      (list) => {
        this.notifications = list;
        this.unreadCount = list.filter(n => !n.read).length;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificationSub) this.notificationSub.unsubscribe();
  }

  // Mark all notifications as read
  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  // -------------------------
  // 🔒 Logout Function
  // -------------------------
  logout(): void {
    this.auth.logout();            // Clear token + user state
    this.notificationService.disconnect(); // stop listening
    this.snack.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/login']);
  }
}
