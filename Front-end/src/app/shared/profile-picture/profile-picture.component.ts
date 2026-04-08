import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';   // ← FIXED PATH
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {

  @Input() currentProfilePictureUrl: string | null = null;
  @Output() profilePictureUpdated = new EventEmitter<string | null>();

  profilePictureUrl: string | null = null;
  isUploading = false;
  user: any;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private apiUrl = `${environment.apiUrl}/auth/profile-picture`;
  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private authService: AuthService     // ← Injected correctly
  ) { }

  ngOnInit() {
    this.profilePictureUrl = this.currentProfilePictureUrl;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showMessage('File size must be less than 5MB', false);
      return;
    }

    this.uploadProfilePicture(file);
  }

  uploadProfilePicture(file: File): void {
    this.isUploading = true;

    const formData = new FormData();
    formData.append('profilePicture', file);

    this.http.put<any>(this.apiUrl, formData).subscribe({
      next: (response) => {
        const imageUrl = response.data?.profilePicture || response.profilePicture;

        // Update local variable
        this.profilePictureUrl = imageUrl || 'assets/default-avatar.jpg';

        // Emit to parent component
        this.profilePictureUpdated.emit(imageUrl);

        // 🔥 Important: Update BehaviorSubject in AuthService
        this.authService.updateUserProfilePicture(imageUrl);

        if (this.fileInput) this.fileInput.nativeElement.value = '';

        this.showMessage('Profile picture updated successfully!', true);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Upload failed:', error);
        this.showMessage(error.error?.message || 'Failed to upload image', false);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  deleteProfilePicture(): void {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    this.profilePictureUrl = null;
    this.profilePictureUpdated.emit(null);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-avatar.jpg';   // or .png
  }

  private showMessage(msg: string, success: boolean): void {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: success ? 'success-snack' : 'error-snack'
    });
  }
}