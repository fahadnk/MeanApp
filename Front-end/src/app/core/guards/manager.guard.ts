import { Injectable } from '@angular/core';
import { RoleGuard } from './role.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ManagerGuard extends RoleGuard {
  override canActivate(route: ActivatedRouteSnapshot) {
    route.data = { ...(route.data || {}), roles: ['manager', 'admin'] }; // admin allowed too
    return super.canActivate(route);
  }
}
