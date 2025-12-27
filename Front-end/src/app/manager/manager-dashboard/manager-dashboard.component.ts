// src/app/pages/manager/manager-dashboard/manager-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { TeamService } from 'src/app/core/services/team.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
  teams: any[] = [];
  currentUser: any;
  displayedColumns: string[] = ['name', 'manager', 'members', 'actions', 'delete'];

  constructor(
    private teamService: TeamService,
    private auth: AuthService,
    private router: Router
  ) {
    this.currentUser = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.list().subscribe({
      next: (res: any) => {
        this.teams = res.data?.data || res;
      },
      error: (err: any) => console.error(err)
    });
  }

  openTeam(team: any) {
    if (!team || !team._id) return;

    this.router.navigate(['/manager/teams', team._id]);
  }

  createTeam() {
    this.router.navigate(['/manager/team/create']);
  }

  deleteTeam(team: any) {
    if (!team || !team._id) return;

    const confirmed = confirm(
      `Are you sure you want to delete team "${team.name}"?`
    );
    if (!confirmed) return;

    this.teamService.deleteAsManager(team._id).subscribe({
      next: () => {
        this.teams = this.teams.filter(t => t._id !== team._id);
      },
      error: err => console.error(err)
    });
  }
}
