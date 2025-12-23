import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TeamService } from 'src/app/core/services/team.service';
import { UserService } from 'src/app/core/services/user.service';
import { TaskService } from 'src/app/core/services/task.service';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent implements OnInit {

  team: any = null;

  /** USERS */
  allUsers: any[] = [];
  teamMembers: any[] = [];

  /** TASKS */
  tasks: any[] = [];

  /** TABLE COLUMNS */
  userColumns: string[] = ['name', 'email', 'actions'];
  membersColumns: string[] = ['name', 'email', 'tasks', 'actions'];
  tasksColumns: string[] = ['title', 'status', 'priority', 'assignedTo', 'actions'];

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private userService: UserService,
    private taskService: TaskService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('id');
    if (teamId) {
      this.loadTeam(teamId);
      this.loadUsers();
      this.loadTasks(teamId);
    }
  }

  /* ================= TEAM ================= */

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe({
      next: (res: any) => {
        this.team = res.data || res;
        this.teamMembers = this.team.members || [];
      },
      error: err => console.error(err)
    });
  }

  /* ================= USERS ================= */

  loadUsers() {
    this.userService.list().subscribe({
      next: (res: any) => {
        const users = res.data || res;

        /** ONLY ROLE = USER */
        this.allUsers = users.filter((u: any) => u.role === 'user');
      },
      error: err => console.error(err)
    });
  }

  addUserToTeam(user: any) {
    this.teamService.addMember(this.team._id, user._id).subscribe({
      next: (res: any) => {
        this.team = res.data || res;
        this.teamMembers = this.team.members;
        this.snack.open('User added to team', 'Close', { duration: 2000 });
      },
      error: err => console.error(err)
    });
  }

  removeUserFromTeam(user: any) {
    this.teamService.removeMember(this.team._id, user._id).subscribe({
      next: (res: any) => {
        this.team = res.data || res;
        this.teamMembers = this.team.members;
        this.snack.open('User removed from team', 'Close', { duration: 2000 });
      },
      error: err => console.error(err)
    });
  }

  viewUser(user: any) {
    this.router.navigate(['/admin/users', user._id]);
  }

  assignTask(user: any) {
    this.router.navigate(['/tasks/new'], {
      queryParams: { assignedTo: user._id, teamId: this.team._id }
    });
  }

  /* ================= TASKS ================= */

  loadTasks(teamId: string) {
    this.taskService.list({ teamId }).subscribe({
      next: (res: any) => {
        this.tasks = res.data || res;
      },
      error: err => console.error(err)
    });
  }

  createTask() {
    this.router.navigate(['/tasks/new'], {
      queryParams: { teamId: this.team._id }
    });
  }

  deleteTask(task: any) {
    this.taskService.delete(task._id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t._id !== task._id);
        this.snack.open('Task deleted', 'Close', { duration: 2000 });
      },
      error: err => console.error(err)
    });
  }

}
