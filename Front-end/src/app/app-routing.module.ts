import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskFormComponent } from './tasks/task-form/task-form.component';
import { TaskDetailsComponent } from './tasks/task-details/task-details.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: 'tasks/new', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: 'tasks/edit/:id', component: TaskFormComponent, canActivate: [AuthGuard]  },
  { path: 'tasks/:id', component: TaskDetailsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
