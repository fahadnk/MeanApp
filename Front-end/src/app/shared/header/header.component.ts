// src/app/shared/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<any>;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit(): void {
    // listen real-time notifications
    this.notificationService.notification$.subscribe((note) => {
      this.notifications.unshift(note);
      this.unreadCount++;
    });
  }

  markAllRead() {
    this.unreadCount = 0;
  }

  logout() {
    this.auth.logout();
  }
}
