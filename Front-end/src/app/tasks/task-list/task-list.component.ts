import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  displayedColumns = ['title', 'status', 'priority', 'assignedTo', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private subs = new Subscription();

  constructor(
    private taskService: TaskService,
    private socketService: SocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.load(1);

    // subscribe to real-time events
    this.socketService.connect();
    this.subs.add(this.socketService.onTaskCreated().subscribe(task => {
      // Option A: reload list (simpler)
      this.load(1);
      // Option B: prepend to existing dataSource.data
      // this.dataSource.data = [task, ...this.dataSource.data];
    }));

    this.subs.add(this.socketService.onTaskUpdated().subscribe(() => {
      this.load(1);
    }));
  }

  load(page = 1) {
    this.taskService.list({ page, limit: 10 }).subscribe(res => {
      // if your backend returns { tasks, pagination }:
      if (res.tasks) {
        this.dataSource.data = res.tasks;
      } else if (Array.isArray(res)) {
        this.dataSource.data = res;
      }
      setTimeout(() => this.dataSource.paginator = this.paginator);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.socketService.disconnect();
  }
}
