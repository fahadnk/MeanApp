import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { TaskService } from 'src/app/core/services/task.service';

@Component({
  selector: 'app-manager-tasks',
  templateUrl: './manager-tasks.component.html',
  styleUrls: ['./manager-tasks.component.scss']
})
export class ManagerTasksComponent implements OnInit {
  tasks: any[] = [];
  currentUser: any;

  constructor(private taskService: TaskService, private auth: AuthService, private router: Router) {
    this.currentUser = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.taskService.list({limit: 50}).subscribe({
      next: (res: { data: any; }) => {
        // filter to team tasks + own tasks if backend doesn't already scope
        this.tasks = (res.data || res).filter((t: any) =>
          t.assignedTo?._id === this.currentUser?.id || t.createdBy?._id === this.currentUser?.id || (t.assignedTo?.team && t.assignedTo.team === this.currentUser?.team)
        );
      },
      error: (err: any) => console.error(err)
    });
  }

  edit(task: any) {
    this.router.navigate(['/tasks', task._id, 'edit']);
  }

  create() {
    this.router.navigate(['/tasks/create']);
  }

  deleteTask(taskId: string) {
    this.taskService.delete(taskId).subscribe({
      next: () => this.load(),
      error: (err: any) => console.error(err)
    });
  }
}
