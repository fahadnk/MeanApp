import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from 'src/app/core/services/task.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
  loading = false;
  isAdmin = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public task: any,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }

  // ----------------------------
  // Priority color mapping
  // ----------------------------
  getPriorityColor(priority: string): 'primary' | 'accent' | 'warn' {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'warn';
      case 'medium':
        return 'accent';
      case 'low':
      default:
        return 'primary';
    }
  }

  // ----------------------------
  // Close dialog
  // ----------------------------
  close(val=false): void {
    this.dialogRef.close(val);
  }

  // ----------------------------
  // Edit task
  // ----------------------------
  onEdit(): void {
    this.close();
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  // ----------------------------
  // Delete task
  // ----------------------------
  onDelete(): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.loading = true;
    this.taskService.delete(this.task.id).subscribe({
      next: () => {
        this.snackBar.open('🗑️ Task deleted successfully', 'OK', { duration: 2000 });
        this.loading = false;
         this.close(true); // trigger refresh in parent
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error deleting task:', err);
        this.snackBar.open('Failed to delete task', 'Dismiss', { duration: 3000 });
         this.close(true);  // trigger refresh in parent
      },
    });
  }
}
