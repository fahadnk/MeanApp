import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  // ----------------------------
  // UI State
  // ----------------------------
  loading = true;

  // ----------------------------
  // Table
  // ----------------------------
  displayedColumns: string[] = ['name', 'manager', 'members'];
  teams: any[] = [];

  // ----------------------------
  // Stats
  // ----------------------------
  taskStats :any;
  userStats :any;
  // ----------------------------
  // Managers
  // ----------------------------
  managers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ----------------------------
  // Load Dashboard Data
  // ----------------------------
  loadDashboard(): void {
    this.loading = true;

    forkJoin({
      teams: this.adminService.getTeams(),
      taskStats: this.adminService.getTaskStats(),
      userStats: this.adminService.getUserStats(),
      managers: this.adminService.getManagers()
    }).subscribe({
      next: (res: any) => {
        this.teams = res.teams?.data || [];
        this.taskStats = res.taskStats || this.taskStats;
        this.userStats = res.userStats || this.userStats;
        this.managers = res.managers?.data || [];
      },
      error: (err) => {
        console.error('❌ Dashboard load failed', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
