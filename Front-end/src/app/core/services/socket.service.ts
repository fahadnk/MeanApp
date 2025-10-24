// src/app/core/services/socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environment/environment';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket?: Socket;
  private reconnecting = false;

  // 🔔 Global connection state observable (optional UI feedback)
  private connectionStatus$ = new Subject<boolean>();

  constructor(private auth: AuthService) {}

  // --------------------------------------------
  // 🔌 Connect to Socket.IO server with JWT auth
  // --------------------------------------------
  connect(): void {
    if (this.socket && this.socket.connected) return;

    const token = this.auth.getToken();
    if (!token) {
      console.warn('⚠️ No auth token found — skipping socket connection.');
      return;
    }

    this.socket = io(environment.socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
    });

    this.handleConnectionEvents();
  }

  // --------------------------------------------
  // 🧠 Handle connection, reconnection & errors
  // --------------------------------------------
  private handleConnectionEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.info('✅ Socket connected:', this.socket?.id);
      this.connectionStatus$.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('❌ Socket disconnected:', reason);
      this.connectionStatus$.next(false);
      this.tryReconnect();
    });

    this.socket.on('connect_error', (err) => {
      console.error('⚠️ Socket connection error:', err.message);
      this.connectionStatus$.next(false);
    });
  }

  // --------------------------------------------
  // ♻️ Attempt auto-reconnect if token is still valid
  // --------------------------------------------
  private tryReconnect(): void {
    if (this.reconnecting) return;
    this.reconnecting = true;

    setTimeout(() => {
      const token = this.auth.getToken();
      if (token) {
        console.info('🔄 Attempting socket reconnect...');
        this.connect();
      }
      this.reconnecting = false;
    }, 4000);
  }

  // --------------------------------------------
  // 🔌 Disconnect cleanly
  // --------------------------------------------
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = undefined;
      console.info('🔌 Socket manually disconnected');
      this.connectionStatus$.next(false);
    }
  }

  // --------------------------------------------
  // ✅ Observable: connection status
  // --------------------------------------------
  connectionChanges(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // --------------------------------------------
  // 📢 Real-time Task Events (Observer Pattern)
  // --------------------------------------------
  onTaskCreated(): Observable<any> {
    return this.listen('taskCreated');
  }

  onTaskUpdated(): Observable<any> {
    return this.listen('taskUpdated');
  }

  onTaskDeleted(): Observable<any> {
    return this.listen('taskDeleted');
  }

  // --------------------------------------------
  // Generic listener wrapper
  // --------------------------------------------
  private listen(event: string): Observable<any> {
    this.ensureConnected();
    return new Observable(observer => {
      if (!this.socket) return;
      const handler = (payload: any) => observer.next(payload);
      this.socket.on(event, handler);

      return () => {
        if (this.socket) this.socket.off(event, handler);
      };
    });
  }

  // --------------------------------------------
  // Ensure connection exists
  // --------------------------------------------
  private ensureConnected(): void {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
  }

  // --------------------------------------------
  // Clean up when destroyed
  // --------------------------------------------
  ngOnDestroy(): void {
    this.disconnect();
    this.connectionStatus$.complete();
  }
}
