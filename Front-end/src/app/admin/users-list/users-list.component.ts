import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns = ['name', 'email', 'role', 'actions'];
  users: any[] = [];

  search = "";
  private searchSubject = new Subject<string>();

  constructor(private admin: AdminService, private router: Router, private snack: MatSnackBar,) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.admin.getUsers().subscribe((res: any) => {
      this.users = res.data;
    });
  }

  clearSearch() {
    this.search = "";
    this.loadUsers();
  }

  view(user: any) {
    this.router.navigate(['/admin/users', user.id]);
  }

  assignTask(user: any) {
    this.router.navigate(['/admin/assign-task', user.id]);
  }

  onSearch(event: any) {
    const value = event.target.value;
  }

  deleteUser(user: any) {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    this.admin.deleteUser(user.id).subscribe({
      next: (response: any) => {
        // Remove user from local array
        this.users = this.users.filter(u => u.id !== user.id);

        // Use message from API, with fallback
        const message = response.message || 'User deleted successfully!';

        this.snack.open(
          `✅ ${message}`,
          'Close',
          { duration: 3000, panelClass: 'success-snack' }
        );
      },
      error: (err) => {
        console.error('Error deleting user:', err);

        // Also handle error message from API if available
        const errorMsg = err.error?.message || err.message || 'Failed to delete user';
        this.snack.open(
          `Error: ${errorMsg}`,
          'Close',
          { duration: 5000, panelClass: 'error-snack' }
        );
      }
    });
  }
}