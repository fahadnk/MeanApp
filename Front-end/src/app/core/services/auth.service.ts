// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';

interface LoginResponse {
  data:{
    token:string
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  register(payload: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/register`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res && res.data && res.data.token) {
          localStorage.setItem(this.tokenKey, res.data.token);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload: any = jwtDecode(token);
      return payload?.exp ? payload.exp * 1000 > Date.now() : true;
    } catch {
      return false;
    }
  }

  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  // optional: get profile from backend
  profile(): Observable<any> {
    return this.http.get(`${this.base}/profile`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
