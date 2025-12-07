import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from 'src/app/core/services/team.service';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent implements OnInit {
  team: any = null;
  allUsers: any[] = [];
  addUserId = '';

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => this.loadTeam(p['id']));
    this.loadUsers();
  }

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe({
      next: (res: { data: any; }) => this.team = res.data || res,
      error: (err: any) => console.error(err)
    });
  }

  loadUsers() {
    this.userService.list().subscribe({
      next: (res: { data: any; }) => this.allUsers = res.data || res,
      error: (err: any) => console.error(err)
    });
  }

  addMember() {
    if (!this.addUserId) return;
    this.teamService.addMember(this.team._id, this.addUserId).subscribe({
      next: (res: any) => {
        this.team = res;
        this.snack.open('Member added', 'Close', { duration: 2000 });
        this.addUserId = '';
      },
      error: (err: any) => console.error(err)
    });
  }

  removeMember(userId: string) {
    this.teamService.removeMember(this.team._id, userId).subscribe({
      next: (res: any) => {
        this.team = res;
        this.snack.open('Member removed', 'Close', { duration: 2000 });
      },
      error: (err: any) => console.error(err)
    });
  }
}
