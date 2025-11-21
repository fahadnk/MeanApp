import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns = ['name', 'email', 'role', 'actions'];
  users: any[] = [];

  constructor(private admin: AdminService, private router: Router, private location: Location) {}

  ngOnInit() {
    this.admin.getUsers().subscribe((res: any) => {
      this.users = res.users;
    });
  }

  view(user: any) {
    this.router.navigate(['/admin/users', user.id]);
  }

  assignTask(user: any) {
    this.router.navigate(['/admin/assign-task', user.id]);
  }

  goBack() {
    this.location.back();
  }
}
