// src/app/shared/shared.module.ts (add these)
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [NotificationBellComponent, HeaderComponent],
  imports: [
    CommonModule,
    MatBadgeModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule
  ],
  exports: [NotificationBellComponent, HeaderComponent]
})
export class SharedModule {}
