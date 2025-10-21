import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent {
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['Pending', Validators.required],
    priority: ['Medium', Validators.required],
    dueDate: ['', Validators.required],
  });

  onSubmit() {
    if (this.taskForm.valid) {
      console.log('Task Saved:', this.taskForm.value);
      // TODO: call TaskService.createTask()
      this.dialogRef.close(this.taskForm.value);
    }
  }
}
