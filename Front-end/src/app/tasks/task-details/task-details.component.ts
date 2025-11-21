import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from 'src/app/core/services/task.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent {
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public task: any,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location
  ) { }

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
  close(): void {
    this.dialogRef.close();
  }

  // ----------------------------
  // Edit task
  // ----------------------------
  onEdit(): void {
    this.dialogRef.close(); // close current dialog
    this.router.navigate(['/tasks/edit', this.task._id]);
  }

  // ----------------------------
  // Delete task
  // ----------------------------
  onDelete(): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.loading = true;
    this.taskService.delete(this.task._id).subscribe({
      next: () => {
        this.snackBar.open('🗑️ Task deleted successfully', 'OK', { duration: 2000 });
        this.loading = false;
        this.dialogRef.close(true); // trigger refresh in parent
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error deleting task:', err);
        this.snackBar.open('Failed to delete task', 'Dismiss', { duration: 3000 });
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
