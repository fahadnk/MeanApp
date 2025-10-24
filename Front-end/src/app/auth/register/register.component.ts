import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  hide = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  // ----------------------------
  // Reactive form definition
  // ----------------------------
  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // ----------------------------
  // Submit handler
  // ----------------------------
  onSubmit() {
    if (this.registerForm.invalid) return;

    // Extract safely typed values
    const { name, email, password } = this.registerForm.value;

    // Ensure all required values are present
    if (!name || !email || !password) return;

    // Call the backend via AuthService
    this.authService
      .register({ name, email, password })
      .subscribe({
        next: (res) => {
          console.log('✅ Registration successful', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('❌ Registration failed', err);
          // Optionally show an error alert or toast here
        },
      });
  }
}
