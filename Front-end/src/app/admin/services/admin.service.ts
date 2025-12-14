// src/app/admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Users
  getUsers() {
    return this.http.get(`${this.base}/users`);
  }

  getUser(id: string) {
    return this.http.get(`${this.base}/users/${id}`);
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.base}/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  // Tasks
  getUserTasks(id: string) {
    return this.http.get(`${this.base}/users/${id}/tasks`);
  }

  createTask(payload: any) {
    return this.http.post(`${this.base}/tasks`, payload);
  }

  deleteTask(taskId: string) {
    return this.http.delete(`${this.base}/tasks/${taskId}`);
  }

  createUser(payload: any) {
    return this.http.post(`${this.base}/user`, payload);
  }
}
