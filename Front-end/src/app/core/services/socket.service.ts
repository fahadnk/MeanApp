import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl); // backend origin
  }

  onTaskCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskCreated', data => observer.next(data));
    });
  }

  onTaskUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskUpdated', data => observer.next(data));
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
