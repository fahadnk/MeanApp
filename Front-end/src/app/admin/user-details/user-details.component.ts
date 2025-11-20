import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: any;
  tasks: any[] = [];

  constructor(private admin: AdminService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.admin.getUser(id).subscribe((res: any) => this.user = res.user);
    this.admin.getUserTasks(id).subscribe((res: any) => this.tasks = res.tasks);
  }
}
