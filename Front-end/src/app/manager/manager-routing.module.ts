// src/app/manager/manager-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ManagerTasksComponent } from './manager-tasks/manager-tasks.component';
import { TeamCreateComponent } from './team-create/team-create.component';
import { RoleGuard } from '../core/guards/role.guard';
import { TeamDetailsComponent } from '../teams/team-details/team-details.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['manager', 'admin'] },
  },
  {
    path: 'team/create',
    component: TeamCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['manager', 'admin'] },
  },
  {
    path: 'tasks',
    component: ManagerTasksComponent,
    canActivate: [RoleGuard],
    data: { roles: ['manager', 'admin'] },
  },
  {
    path: 'teams/:id',
    component: TeamDetailsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['manager', 'admin'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}
