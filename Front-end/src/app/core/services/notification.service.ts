// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

export interface NotificationItem {
  _id?: string;
  message: string;
  data?: any;
  read?: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: Socket | null = null;

  /** 
   * Emits a full list of notifications 
   */
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  /**
   * Emits only the latest single notification (for real-time header updates)
   */
  private singleNotificationSubject = new BehaviorSubject<NotificationItem | null>(null);
  public notification$ = this.singleNotificationSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // -----------------------------------------
  //  Connect to WebSocket and listen for events
  // -----------------------------------------
  connect(userId: string, token?: string) {
    if (this.socket) return;

    const url = environment.socketUrl || environment.apiUrl;

    this.socket = io(url, {
      auth: token ? { token } : undefined,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.socket!.emit('identify', userId);
    });

    // 🔵 Real-time: task assigned to user
    this.socket.on('taskAssigned', (payload: any) => {
      const note: NotificationItem = {
        message: payload.message || `New task: ${payload.task?.title || ''}`,
        data: payload,
        read: false,
        createdAt: new Date().toISOString(),
      };

      this.pushNotification(note);
    });

    // 🔵 Generic notification
    this.socket.on('notification', (payload: any) => {
      const note: NotificationItem = {
        message: payload.message || 'Notification',
        data: payload,
        read: false,
        createdAt: new Date().toISOString(),
      };

      this.pushNotification(note);
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  // -----------------------------------------
  // Push a new notification locally AND emit real-time single notification
  // -----------------------------------------
  private pushNotification(item: NotificationItem) {
    const current = [...this.notificationsSubject.value];
    current.unshift(item);

    this.notificationsSubject.next(current);

    // Emit only *one* notification for header UI
    this.singleNotificationSubject.next(item);

    // Update unread count
    this.unreadCountSubject.next(current.filter((n) => !n.read).length);
  }

  // -----------------------------------------
  // REST Requests (optional for persistence)
  // -----------------------------------------
  fetchNotifications(): Observable<{ data: NotificationItem[] }> {
    return this.http.get<{ data: NotificationItem[] }>(`${environment.apiUrl}/notifications`);
  }

  markAsRead(notificationId: string) {
    const list = this.notificationsSubject.value.map((n) =>
      n._id === notificationId ? { ...n, read: true } : n
    );

    this.notificationsSubject.next(list);
    this.unreadCountSubject.next(list.filter((n) => !n.read).length);

    return this.http.post(`${environment.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead() {
    const list = this.notificationsSubject.value.map((n) => ({ ...n, read: true }));
    this.notificationsSubject.next(list);
    this.unreadCountSubject.next(0);

    return this.http.post(`${environment.apiUrl}/notifications/read-all`, {});
  }
}
