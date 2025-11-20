// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  data: {
    token: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;
  private tokenKey = 'token';

  // ---------------------------------------------
  // 🌟 NEW: Current User State (BehaviorSubject)
  // ---------------------------------------------
  private currentUserSubject = new BehaviorSubject<any | null>(this.loadUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // -------------------
  // Register
  // -------------------
  register(payload: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/register`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // -------------------
  // Login
  // -------------------
  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res?.data?.token) {
          localStorage.setItem(this.tokenKey, res.data.token);

          // NEW: update currentUser$
          const decoded = this.safeDecode(res.data.token);
          this.currentUserSubject.next(decoded);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // -------------------
  // Logout
  // -------------------
  logout() {
    localStorage.removeItem(this.tokenKey);

    // NEW: notify subscribers that user is logged out
    this.currentUserSubject.next(null);
  }

  // -------------------
  // Get Token
  // -------------------
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // -------------------
  // Check Authentication
  // -------------------
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

  // -------------------
  // Decode Current User (manual call)
  // -------------------
  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  // -------------------
  // Optional Profile Endpoint
  // -------------------
  profile(): Observable<any> {
    return this.http.get(`${this.base}/profile`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ======================================================
  // 🌟 NEW HELPER FUNCTIONS (used internally only)
  // ======================================================

  private safeDecode(token: string): any | null {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  private loadUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        return null; // expired token
      }
      return decoded;
    } catch {
      return null;
    }
  }
}
