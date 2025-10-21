import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailsComponent } from '../task-details/task-details.component';

interface Task {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: Date;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'assignedTo',
    'dueDate',
    'actions',
  ];

  dataSource = new MatTableDataSource<Task>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    // TODO: Replace with TaskService -> getTasks()
    this.dataSource.data = [
      {
        title: 'Prepare report',
        description: 'Quarterly finance report',
        status: 'In Progress',
        priority: 'High',
        assignedTo: 'Fahad',
        dueDate: new Date(),
      },
      {
        title: 'Code Review',
        description: 'Review MEAN app backend',
        status: 'Pending',
        priority: 'Medium',
        assignedTo: 'Ali',
        dueDate: new Date(),
      },
    ];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openCreateDialog() {
    this.dialog.open(TaskFormComponent, { width: '450px' });
  }

  openDetails(task: Task) {
    this.dialog.open(TaskDetailsComponent, {
      width: '500px',
      data: task,
    });
  }
}
