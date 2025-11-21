// src/app/shared/components/notification-bell/notification-bell.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  unread = 0;
  subs: Subscription[] = [];

  // controls dropdown open state for styling
  isOpen = false;

  constructor(private notif: NotificationService, private router: Router) {}

  ngOnInit() {
    this.subs.push(
      this.notif.notifications$.subscribe((list) => (this.notifications = list))
    );
    this.subs.push(
      this.notif.unreadCount$.subscribe((count) => (this.unread = count))
    );

    // initial fetch (optional) — populates current notifications; backend endpoint may vary
    this.notif.fetchNotifications().subscribe({
      next: (res: any) => {
        if (res?.data) {
          // replace local store with server data
          this.notifications = res.data.concat(this.notifications);
        }
      },
      error: () => {
        // silently ignore; socket will provide live updates
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggle(menuRef?: any) {
    this.isOpen = !this.isOpen;
  }

  openNotification(n: NotificationItem) {
    // Example: if notification has task data, navigate to task page
    if (n.data?.task && n.data.task._id) {
      this.router.navigate(['/tasks', n.data.task._id]);
    }
    // mark as read locally and on server
    if (n._id) {
      this.notif.markAsRead(n._id).subscribe({
        error: () => {}
      });
    }
  }

  markAll() {
    this.notif.markAllAsRead().subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
