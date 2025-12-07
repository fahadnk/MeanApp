// src/app/manager/manager.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerRoutingModule } from './manager-routing.module';

import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ManagerTasksComponent } from './manager-tasks/manager-tasks.component';
import { TeamCreateComponent } from './team-create/team-create.component';
import { TeamDetailsComponent } from '../teams/team-details/team-details.component';

@NgModule({
  declarations: [
    ManagerDashboardComponent,
    ManagerTasksComponent,
    TeamCreateComponent,
    TeamDetailsComponent
  ],
  imports: [CommonModule, ManagerRoutingModule]
})
export class ManagerModule {}
