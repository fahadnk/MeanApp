import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamService } from 'src/app/core/services/team.service';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
})
export class TeamCreateComponent {
  // Strongly typed FormGroup
  form: any;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private router: Router
  ) {
    this.initializeForm();
  }

  /**
   * Initialize the reactive form
   * - nonNullable ensures the value is always a string
   * - Validators.required ensures form is not submitted empty
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3)],
        nonNullable: true, // ensures the value is never null
      }),
    });
  }

  /**
   * Handle form submission
   * - Validate form before submitting
   * - Use strict typing for value
   * - Navigate to /manager after successful creation
   */
  submit(): void {
    if (this.form.invalid) return;

    // Type-safe access to form value
    const payload: { name: string } = this.form.value;

    this.teamService.create(payload).subscribe({
      next: (res) => {
        // Navigate to manager dashboard on success
        this.router.navigate(['/manager']);
      },
      error: (err) => {
        // Proper error handling (you can extend this to show toast messages)
        console.error('Error creating team:', err);
      },
    });
  }
}
