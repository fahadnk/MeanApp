// src/app/features/tasks/task-list/task-list.component.ts

import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  displayedColumns: string[] = ['title', 'priority', 'status', 'dueDate', 'actions'];

  // filters + pagination
  page = 1;
  limit = 10;
  total = 0;
  search = '';
  status = '';
  priority = '';

  constructor(private taskService: TaskService, private snack: MatSnackBar,  private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const options = {
      page: this.page,
      limit: this.limit,
      search: this.search,
      status: this.status,
      priority: this.priority,
    };

    this.taskService.list(options).subscribe({
      next: (res) => {
        this.tasks = res.tasks || res; // supports either paginated or plain array
        this.total = res.pagination?.total || this.tasks.length;
      },
      error: (err) => {
        console.error('❌ Error loading tasks:', err);
        this.snack.open('Failed to load tasks', 'Close', { duration: 3000 });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadTasks();
  }

  clearSearch(): void {
    this.search = '';
    this.loadTasks();
  }

  confirmDelete(task: any): void {
    if (confirm(`Delete task "${task.title}"?`)) {
      this.taskService.delete(task.id).subscribe({
        next: () => {
          this.snack.open('Task deleted', 'Close', { duration: 2500 });
          this.loadTasks();
        },
        error: (err) => {
          console.error('❌ Delete error:', err);
          this.snack.open('Failed to delete task', 'Close', { duration: 2500 });
        },
      });
    }
  }

    // -------------------------
  // 🔒 Logout Function
  // -------------------------
  logout(): void {
    localStorage.removeItem('token'); // remove JWT token
    this.snack.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/login']); // navigate to login page
  }
}
