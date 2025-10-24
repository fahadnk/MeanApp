import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from 'src/app/core/services/task.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  totalTasks = 0;
  searchTerm = '';
  statusFilter = '';
  page = 1;
  limit = 10;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private taskService: TaskService,
    private socketService: SocketService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.socketService.onTaskCreated().subscribe(() => this.refreshAfterSocket('Task created'));
    this.socketService.onTaskUpdated().subscribe(() => this.refreshAfterSocket('Task updated'));
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService
      .list({
        page: this.page,
        limit: this.limit,
        search: this.searchTerm || undefined,
        status: this.statusFilter || undefined
      })
      .subscribe({
        next: (res) => {
          this.tasks = res?.data || res || [];
          this.totalTasks = res?.total || this.tasks.length;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = value;
    this.page = 1;
    this.loadTasks();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadTasks();
  }

  openTaskDetails(task: any): void {
    this.dialog.open(TaskDetailsComponent, { width: '600px', data: task });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadTasks();
    });
  }

  openEditDialog(task: any): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { task },
    });
    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadTasks();
    });
  }

  private refreshAfterSocket(message: string) {
    this.snackBar.open(message, 'OK', { duration: 2000 });
    this.loadTasks();
  }
}
