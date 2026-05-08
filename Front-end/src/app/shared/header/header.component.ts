import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  currentUser$: Observable<any>;
  notifications: any[] = [];
  unreadCount = 0;
  showBackButton = true;
  profilePictureUrl: string | null = null;

  private notificationSub?: Subscription;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private snack: MatSnackBar,
    private router: Router,
    private location: Location
  ) {
    this.currentUser$ = this.auth.currentUser$;

    // Detect route changes to hide/show back button
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/tasks', '/manager', '/admin'];
        this.showBackButton = !hiddenRoutes.includes(event.url);
      });
  }

  ngOnInit(): void {
    this.notificationSub = this.notificationService.notifications$.subscribe(
      (list) => {
        this.notifications = list;
        this.unreadCount = list.filter(n => !n.read).length;
      }
    );
    const user = this.auth.getCurrentUser();
    if (!user?.profilePicture) {
      this.auth.loadAndUpdateProfilePicture();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) this.notificationSub.unsubscribe();
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  logout(): void {
    this.auth.logout();
    this.notificationService.disconnect();
    this.snack.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/login']);
  }

  goBack() {
    this.location.back();
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

   getProfileImageUrl(profilePicture: string | null): string {
    if (!profilePicture) return '';
    else return profilePicture;
  }
  
  onImageError(event: any): void {
    event.target.src = 'assets/default-avatar.jpg';
  }
}
