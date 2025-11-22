import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from 'src/app/tasks/task-details/task-details.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: any;
  tasks: any[] = [];

  displayedColumns = ['title', 'status', 'priority', 'createdAt'];
  dataSource = new MatTableDataSource<any>();

  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private admin: AdminService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.admin.getUser(id).subscribe((res: any) => {
      this.user = res.user;
    });

    this.admin.getUserTasks(id).subscribe((res: any) => {
      this.tasks = res.tasks;
      this.dataSource.data = this.tasks;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    this.dataSource.filterPredicate = (task, filter) => {
      const f = JSON.parse(filter);

      const matchesText =
        task.title.toLowerCase().includes(f.search) ||
        task.description?.toLowerCase().includes(f.search);

      const matchesStatus = f.status ? task.status === f.status : true;
      const matchesPriority = f.priority ? task.priority === f.priority : true;

      return matchesText && matchesStatus && matchesPriority;
    };
  }

  applySearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      search: this.searchTerm,
      status: this.selectedStatus,
      priority: this.selectedPriority
    });
  }

  openTask(task: any) {
    this.dialog.open(TaskDetailsComponent, {
      width: '600px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: false,
      data: task,
      panelClass: 'task-details-dialog'
    });
  }
}
