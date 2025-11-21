import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
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

  // Custom validator
  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;

    return pass === confirm ? null : { passwordMismatch: true };
  }

  // ----------------------------
  // Reactive Form
  // ----------------------------
  registerForm = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['user', Validators.required], // default role
    },
    { validators: this.passwordMatchValidator.bind(this) }
  );

  // ----------------------------
  // Submit handler
  // ----------------------------
  onSubmit() {
    if (this.registerForm.invalid) return;

    const { name, email, password, role } = this.registerForm.value;

    if (!name || !email || !password || !role) return;

    this.authService
      .register({ name, email, password, role })
      .subscribe({
        next: (res) => {
          console.log('✅ Registration successful', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('❌ Registration failed', err);
        },
      });
  }
}
