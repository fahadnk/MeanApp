import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from 'src/app/core/services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  isEdit = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['Pending', Validators.required],
    priority: ['Medium', Validators.required],
    dueDate: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.data && this.data.task) {
      this.isEdit = true;
      this.taskForm.patchValue(this.data.task);
    }
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.loading = true;

    const payload = this.taskForm.value;

    const request = this.isEdit
      ? this.taskService.update(this.data.task._id, payload)
      : this.taskService.create(payload);

    request.subscribe({
      next: (res) => {
        this.loading = false;
        this.snackBar.open(
          this.isEdit ? '✅ Task updated successfully!' : '✅ Task created successfully!',
          'Close',
          { duration: 2500 }
        );
        this.dialogRef.close(true); // true = refresh
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Failed to save task', err);
        this.snackBar.open('Failed to save task', 'Close', { duration: 2500 });
      },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
