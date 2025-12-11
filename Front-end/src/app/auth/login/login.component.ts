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
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (!this.loginForm.valid) return;
    this.auth.login(this.loginForm.value as { email: string; password: string }).subscribe({
      next: (res: any) => {
          if (res?.data?.mustResetPassword) {
          this.router.navigate(['/reset-password']);
        } else {
          this.router.navigate(['/tasks']);
        }
      },
      error: err => console.error('Login failed', err)
    });
  }
}
