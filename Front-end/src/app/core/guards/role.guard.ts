// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed = route.data['roles'] as string[] | string;
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    const roles = Array.isArray(allowed) ? allowed : [allowed];
    if (!roles.includes(user.role)) {
      // not allowed
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
