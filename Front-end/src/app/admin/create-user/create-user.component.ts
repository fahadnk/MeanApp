import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserComponent {

  roles = ['user', 'manager', 'admin'];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user', Validators.required]
  });

  loading = false;

  constructor(
    private fb: FormBuilder,
    private admin: AdminService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<CreateUserComponent>
  ) {}

  createUser() {
    if (this.form.invalid) {
      this.snack.open("Please fill all required fields", "Close", { duration: 3000 });
      return;
    }

    this.loading = true;

    this.admin.createUser(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.snack.open("User created successfully!", "Close", { duration: 3000 });
        this.dialogRef.close('created');
      },
      error: (err:any) => {
        this.loading = false;
        const msg = err.error?.message || "Failed to create user";
        this.snack.open(msg, "Close", { duration: 4000 });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
