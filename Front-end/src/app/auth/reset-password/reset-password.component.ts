import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  hide = true;
  email!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get email from login redirect
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.['email'] || '';
  }

  onSubmit() {
    if (this.form.invalid || !this.email) return;

    this.authService.resetPassword(this.email, this.form.value.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            queryParams: { resetSuccess: true }
          });
        },
        error: (err:any) => {
          console.log(err);
        }
      });
  }
}
