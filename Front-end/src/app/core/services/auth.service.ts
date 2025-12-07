// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode }from 'jwt-decode';

interface LoginResponse {
  data: {
    token: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;
  private tokenKey = 'token';

  // -------------------------------------------------------
  // 🌟 NEW: Current User BehaviorSubject (Merged From New Version)
  // -------------------------------------------------------
  private currentUserSubject = new BehaviorSubject<any | null>(this.loadUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // -------------------------------------------------------
  // Register (Unchanged)
  // -------------------------------------------------------
  register(payload: { name: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.base}/register`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // -------------------------------------------------------
  // Login (Original Logic + Updated BehaviorSubject Handling)
  // -------------------------------------------------------
  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap((res: any) => {
        if (res?.data?.token) {
          localStorage.setItem(this.tokenKey, res.data.token);

          // Merge: use updated decoding method
          const decoded = this.safeDecode(res.data.token);
          this.currentUserSubject.next(decoded);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // -------------------------------------------------------
  // Logout (Unchanged Except BehaviorSubject Update)
  // -------------------------------------------------------
  logout() {
    localStorage.removeItem(this.tokenKey);

    // Notify subscribers user is logged out
    this.currentUserSubject.next(null);
  }

  // -------------------------------------------------------
  // Get Token (Same as Before)
  // -------------------------------------------------------
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // -------------------------------------------------------
  // Check Authentication (Same as Before)
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // Decode Current User Manually (Original Behavior)
  // -------------------------------------------------------
  getCurrentUser(): any | null {
    return this.currentUserSubject.value;
  }

  // -------------------------------------------------------
  // Optional Profile Endpoint (Unchanged)
  // -------------------------------------------------------
  profile(): Observable<any> {
    return this.http.get(`${this.base}/profile`).pipe(
      catchError(err => throwError(() => err))
    );
  }


  // ======================================================
  // 🌟 MERGED NEW HELPER FUNCTIONS (Updated Internal Decoders)
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
        return null; // expired
      }
      return decoded;
    } catch {
      return null;
    }
  }
}
