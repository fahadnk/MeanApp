// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // -------------------------
  // List tasks with optional pagination, search, filter
  // -------------------------
  list(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;   // optional status filter (kept for backward compatibility)
    priority?: string; // optional priority filter (kept for backward compatibility)
  } = {}): Observable<any> {
    let params = new HttpParams();

    // Pagination
    if (options.page != null) params = params.set('page', String(options.page));
    if (options.limit != null) params = params.set('limit', String(options.limit));

    // Search
    if (options.search) params = params.set('search', options.search);

    // Optional filters
    if (options.status) params = params.set('status', options.status);
    if (options.priority) params = params.set('priority', options.priority);

    return this.http.get(this.base, { params });
  }

  // -------------------------
  // Get single task by ID
  // -------------------------
  getById(id: string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  // -------------------------
  // Create new task
  // -------------------------
  create(payload: any): Observable<any> {
    return this.http.post(this.base, payload);
  }

  // -------------------------
  // Update existing task
  // -------------------------
  update(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  // -------------------------
  // Delete task
  // -------------------------
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  // -------------------------
  // Task stats (group by status, priority, etc.)
  // -------------------------
  stats(groupBy: string = 'status'): Observable<any> {
    return this.http.get(`${this.base}/stats/${groupBy}`);
  }
}
