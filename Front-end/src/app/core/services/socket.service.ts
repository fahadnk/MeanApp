import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket?: Socket;

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.socket && this.socket.connected) return;

    const token = this.auth.getToken();
    // sends token as query param; backend can verify if you want
    this.socket = io(environment.socketUrl || environment.apiUrl, {
      auth: { token }, // socket.io v4 supports auth object
      transports: ['websocket'],
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  onTaskCreated(): Observable<any> {
    this.ensureConnected();
    return new Observable(observer => {
      this.socket!.on('taskCreated', (payload: any) => observer.next(payload));
      return () => this.socket!.off('taskCreated');
    });
  }

  onTaskUpdated(): Observable<any> {
    this.ensureConnected();
    return new Observable(observer => {
      this.socket!.on('taskUpdated', (payload: any) => observer.next(payload));
      return () => this.socket!.off('taskUpdated');
    });
  }

  private ensureConnected() {
    if (!this.socket || !this.socket.connected) this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
