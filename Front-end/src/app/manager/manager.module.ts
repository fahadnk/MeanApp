// src/app/manager/manager.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerRoutingModule } from './manager-routing.module';

import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ManagerTasksComponent } from './manager-tasks/manager-tasks.component';
import { TeamCreateComponent } from './team-create/team-create.component';

// Angular Material for tables
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// Other Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// Forms
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TeamDetailsComponent } from '../teams/team-details/team-details.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ManagerDashboardComponent,
    ManagerTasksComponent,
    TeamCreateComponent,
    TeamDetailsComponent
  ],
  imports: [
    CommonModule,
    ManagerRoutingModule,

    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    // Forms
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class ManagerModule { }
