import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(params: any): Observable<any> {
    return this.http.get(this.api, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
