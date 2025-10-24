// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // list with pagination, search, filter
  list(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
  } = {}): Observable<any> {
    let params = new HttpParams();
    if (options.page != null) params = params.set('page', String(options.page));
    if (options.limit != null) params = params.set('limit', String(options.limit));
    if (options.search) params = params.set('search', options.search);
    if (options.status) params = params.set('status', options.status);
    if (options.priority) params = params.set('priority', options.priority);

    return this.http.get(this.base, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.base, payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  stats(groupBy = 'status'): Observable<any> {
    return this.http.get(`${this.base}/stats/${groupBy}`);
  }
}
