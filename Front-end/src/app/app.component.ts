import { Component } from '@angular/core';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Front-end';
  constructor(private notif: NotificationService, private auth: AuthService) {}

  ngOnInit() {
    // if you store user and token in auth service
    this.auth.currentUser$.subscribe(user => {
      if (user?.id) {
        const token: any = this.auth.getToken();
        this.notif.connect(user.id, token);
      } else {
        this.notif.disconnect();
      }
    });
  }
}
