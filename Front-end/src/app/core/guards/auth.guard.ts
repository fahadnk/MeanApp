import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(): boolean {
    const token = this.auth.getToken();
    if (!this.auth.isAuthenticated() || !token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.auth.mustResetPassword()) {
      this.router.navigate(['/reset-password']);
      return false;
    }
    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) throw new Error('Expired');
      return true;
    } catch {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
