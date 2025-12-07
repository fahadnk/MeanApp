import { Injectable } from '@angular/core';
import { RoleGuard } from './role.guard';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard extends RoleGuard {
  override canActivate(route: ActivatedRouteSnapshot): boolean {
    route.data = { ...(route.data || {}), roles: ['admin'] };
    return super.canActivate(route);
  }
}
