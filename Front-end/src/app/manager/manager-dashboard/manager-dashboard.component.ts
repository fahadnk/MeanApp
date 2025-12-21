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
  displayedColumns: string[] = ['name', 'manager', 'members', 'actions'];

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
      next: (res:any) => {
        this.teams = res.data?.data || res;
      },
      error: (err:any) => console.error(err)
    });
  }

  openTeam(team: any) {
    this.router.navigate(['/manager/teams', team._id]);
  }

  createTeam() {
    this.router.navigate(['/manager/team/create']);
  }
}
