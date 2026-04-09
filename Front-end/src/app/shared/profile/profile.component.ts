import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Observable } from 'rxjs';

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
  profilePictureUrl: string = 'assets/default-avatar.jpg';
  currentUser$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private snack: MatSnackBar,
    private router: Router,
    private http: HttpClient,
  ) {
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();

    // Subscribe to currentUser$ - this is the most reliable way
    this.auth.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user = currentUser;
        this.profilePictureUrl = currentUser.profilePicture
          ? currentUser.profilePicture
          : 'assets/default-avatar.jpg';
      }
    });

    // Force refresh profile picture from backend (important on hard refresh)
    this.auth.loadAndUpdateProfilePicture();

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

  // This method will be called when profile picture is updated or deleted
  onProfilePictureUpdated(newUrl: string | null) {
    const finalUrl = newUrl || 'assets/default-avatar.jpg';

    this.profilePictureUrl = finalUrl;
    this.user = { ...this.user, profilePicture: newUrl };

    this.auth.updateUserProfilePicture(newUrl);
  }
}
