import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from 'src/app/core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';

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
    private dialog: MatDialog
  ) {}

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
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { ...this.task },
    });

    dialogRef.afterClosed().subscribe((updatedData) => {
      if (updatedData) {
        this.loading = true;
        this.taskService.update(this.task._id, updatedData).subscribe({
          next: (res) => {
            this.snackBar.open('✅ Task updated successfully', 'OK', { duration: 2000 });
            this.loading = false;
            this.dialogRef.close(true); // trigger parent refresh
          },
          error: (err) => {
            this.loading = false;
            console.error('❌ Error updating task:', err);
            this.snackBar.open('Failed to update task', 'Dismiss', { duration: 3000 });
          },
        });
      }
    });
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
}
