import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  token: string;
  // optionally other payload
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`; // e.g. http://localhost:5000/api/auth
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(payload: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post(`${this.base}/register`, payload);
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
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // convenience to get current user info from token payload (id, role, etc.)
  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
}
