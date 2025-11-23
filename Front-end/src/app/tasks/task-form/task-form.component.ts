import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TaskService } from 'src/app/core/services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  taskId: string | null = null;
  today = new Date();

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    priority: ['medium', Validators.required],
    dueDate: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Check for edit mode via URL param
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEdit = true;
      this.loadTask(this.taskId);
    }
  }

  loadTask(id: string) {
    this.taskService.getById(id).subscribe({
      next: (task) => this.taskForm.patchValue(task.task),
      error: (err) => {
        console.error('Failed to load task', err);
        this.snackBar.open('Failed to load task', 'Close', { duration: 2500 });
        this.router.navigate(['/tasks']); // redirect back if fail
      },
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.loading = true;

    const payload = this.taskForm.value;

    const request = this.isEdit
      ? this.taskService.update(this.taskId!, payload)
      : this.taskService.create(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(
          this.isEdit ? '✅ Task updated successfully!' : '✅ Task created successfully!',
          'Close',
          { duration: 2500 }
        );
        this.router.navigate(['/tasks']); // navigate to task list
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Failed to save task', err);
        this.snackBar.open('Failed to save task', 'Close', { duration: 2500 });
      },
    });
  }

  onCancel() {
    this.location.back();
  }

  get isPastDate(): boolean {
    const dueDate = this.taskForm.get('dueDate')?.value;
    if (!dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(dueDate);
    return selected < today;
  }


}
