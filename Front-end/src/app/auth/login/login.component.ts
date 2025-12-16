import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  hide = true;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (!this.loginForm.valid) return;

    this.auth.login(
      this.loginForm.value as { email: string; password: string }
    ).subscribe({
      next: (res: any) => {
        // 🔴 First-time password reset
        if (res?.data?.mustResetPassword) {
          this.router.navigate(['/reset-password'], {
            state: { email: this.loginForm.value.email }
          });
          return;
        }

        // 🟢 Decode role from token
        const user = this.auth.getCurrentUser();
        const role = user?.role;

        // 🔁 Role-based routing
        switch (role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;

          case 'manager':
            this.router.navigate(['/manager']);
            break;

          default:
            this.router.navigate(['/tasks']);
        }
      },
      error: err => console.error('Login failed', err)
    });
  }

}
