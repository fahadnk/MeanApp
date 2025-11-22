import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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

  constructor(private admin: AdminService, private router: Router) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.admin.getUsers().subscribe((res: any) => {
      this.users = res.users;
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
}
