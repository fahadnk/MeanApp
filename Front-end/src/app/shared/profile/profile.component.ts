import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: any;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();

    this.profileForm = this.fb.group({
      email: [{ value: this.user?.email, disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  /* ================= PROFILE UPDATE ================= */

  // updateProfile() {
  //   if (this.profileForm.invalid) return;

  //   this.loading = true;

  //   this.userService.updateProfile().subscribe({
  //     next: (res: any) => {
  //       this.loading = false;
  //       this.auth.updateCurrentUser(res.data || res);
  //       this.snack.open('Profile updated successfully', 'Close', { duration: 2000 });
  //     },
  //     error: err => {
  //       this.loading = false;
  //       console.error(err);
  //     }
  //   });
  // }

  /* ================= PASSWORD UPDATE ================= */

  updatePassword() {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snack.open('Passwords do not match', 'Close', { duration: 2000 });
      return;
    }

    this.loading = true;

    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.passwordForm.reset();
        this.snack.open('Password updated successfully', 'Close', { duration: 2000 });
        this.router.navigate(['/admin']);
      },
      error: err => {
        this.loading = false;
        console.error(err);
      }
    });
  }
}
