import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/auth`; // your users endpoints earlier were under /auth or /admin

  constructor(private http: HttpClient) { }

  list(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/users`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.base}/users/${id}`);
  }

  getUsersForManager() {
    return this.http.get(`${environment.apiUrl}/manager/users`);
  }

  changePassword(payload: any) {
    return this.http.post(`${environment.apiUrl}/auth/reset-password-auth`, payload);
  }
}
