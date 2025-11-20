import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-assign-task',
  templateUrl: './assign-task.component.html',
  styleUrls: ['./assign-task.component.scss']
})
export class AssignTaskComponent implements OnInit {
  userId!: string;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['medium'],
    status: ['pending'],
    assignedTo: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private admin: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.form.patchValue({ assignedTo: this.userId });
  }

  submit() {
    if (this.form.invalid) return;

    this.admin.createTask(this.form.value).subscribe(() => {
      this.router.navigate(['/admin/users', this.userId]);
    });
  }
}
