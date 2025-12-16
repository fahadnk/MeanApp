// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  // Charts
  taskChartData: ChartData<'doughnut'> = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{ data: [0, 0, 0] }]
  };

  userChartData: ChartData<'pie'> = {
    labels: ['Users', 'Managers'],
    datasets: [{ data: [0, 0] }]
  };

  // Table data
  teams: any;
  managers: any;

  loading = true;

  constructor(private dashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  async loadDashboard() {
    this.loading = true;
    try {
      const taskStats = await firstValueFrom(this.dashboardService.getTaskStats());
      const userStats = await firstValueFrom(this.dashboardService.getUserStats());
      const teams = await firstValueFrom(this.dashboardService.getTeams());
      const managers = await firstValueFrom(this.dashboardService.getManagers());

      this.teams = teams;
      this.managers = managers;

      this.taskChartData.datasets[0].data = [
        taskStats.completed,
        taskStats.inProgress,
        taskStats.pending
      ];

      this.userChartData.datasets[0].data = [
        userStats.usersCount,
        userStats.managersCount
      ];

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}
