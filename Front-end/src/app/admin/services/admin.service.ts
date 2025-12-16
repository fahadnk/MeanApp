// src/app/admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ======================
  // USERS (existing)
  // ======================
  getUsers() {
    return this.http.get<any>(`${this.base}/users`);
  }

  getUser(id: string) {
    return this.http.get<any>(`${this.base}/users/${id}`);
  }

  updateUser(id: string, data: any) {
    return this.http.put<any>(`${this.base}/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete<any>(`${this.base}/users/${id}`);
  }

  createUser(payload: any) {
    return this.http.post<any>(`${this.base}/user`, payload);
  }

  // ======================
  // TASKS (existing)
  // ======================
  getUserTasks(id: string) {
    return this.http.get<any>(`${this.base}/users/${id}/tasks`);
  }

  createTask(payload: any) {
    return this.http.post<any>(`${this.base}/tasks`, payload);
  }

  deleteTask(taskId: string) {
    return this.http.delete<any>(`${this.base}/tasks/${taskId}`);
  }

  // ==================================================
  // 🟩 DASHBOARD — NEW METHODS (USED BY ADMIN DASHBOARD)
  // ==================================================

  /**
   * 📊 Get overall task statistics
   * Response example:
   * {
   *   completed: number,
   *   pending: number,
   *   inProgress: number
   * }
   */
  getTaskStats() {
    return this.http.get<any>(`${this.base}/dashboard/task-stats`);
  }

  /**
   * 👥 Get users count
   * Response:
   * {
   *   totalUsers: number,
   *   totalManagers: number
   * }
   */
  getUserStats() {
    return this.http.get<any>(`${this.base}/dashboard/user-stats`);
  }

  /**
   * 👔 Get all managers list
   * Response:
   * [{ _id, name, email }]
   */
  getManagers() {
    return this.http.get<any[]>(`${this.base}/dashboard/managers`);
  }

  /**
   * 🧩 Get all teams
   * Response:
   * [{ _id, name, membersCount }]
   */
  getTeams() {
    return this.http.get<any[]>(`${this.base}/dashboard/teams`);
  }
}
