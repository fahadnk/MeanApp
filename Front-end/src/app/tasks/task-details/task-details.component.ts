import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from 'src/app/core/services/task.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

interface ActivityLog {
  _id: string;
  action: string;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    initials?: string;
  } | null;
  changes: any;
  message?: string;
  timeAgo?: string;
  formattedTimestamp?: string;
  createdAt: string;
  metadata?: any;
}

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
  loading = false;
  isAdmin = false;
  activityLogs: ActivityLog[] = [];
  activityLoading = false;
  objectKeys = Object.keys;
  Object = Object;

  private avatarColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E2', '#F8C471', '#E59866'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public task: any,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
    this.loadActivity();
  }

  getPriorityColor(priority: string): 'primary' | 'accent' | 'warn' {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'warn';
      case 'medium':
        return 'accent';
      case 'low':
      default:
        return 'primary';
    }
  }

  close(val = false): void {
    this.dialogRef.close(val);
  }

  onEdit(): void {
    this.close();
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  onDelete(): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.loading = true;
    this.taskService.delete(this.task.id).subscribe({
      next: () => {
        this.snackBar.open('🗑️ Task deleted successfully', 'OK', { duration: 2000 });
        this.loading = false;
        this.close(true);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error deleting task:', err);
        this.snackBar.open('Failed to delete task', 'Dismiss', { duration: 3000 });
      },
    });
  }

  loadActivity(): void {
    this.activityLoading = true;

    this.taskService.getTaskActivity(this.task.id).subscribe({
      next: (response: any) => {
        this.activityLogs = response?.data || [];
        this.activityLoading = false;
      },
      error: (err) => {
        console.error('Failed to load activity', err);
        this.activityLoading = false;
        this.snackBar.open('Failed to load activity log', 'Dismiss', { duration: 3000 });
      }
    });
  }

  // New method to handle tooltip text safely
  getTooltipText(log: ActivityLog): string {
    if (log.formattedTimestamp) {
      return log.formattedTimestamp;
    }
    if (log.createdAt) {
      return new Date(log.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'No date available';
  }

  getInitials(name: string | undefined | null): string {
    if (!name) return '?';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarColor(name: string | undefined | null): string {
    if (!name) return '#ccc';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  hasChanges(log: ActivityLog): boolean {
    return log.changes && Object.keys(log.changes).length > 0;
  }

  getChangeValue(change: any, type: 'from' | 'to'): any {
    if (!change || !change[type]) return 'Not set';
    
    if (change[type]?.label) return change[type].label;
    if (change[type]?.name) return change[type].name;
    if (change[type]?.formatted) return change[type].formatted;
    if (change[type]?.preview) return change[type].preview;
    
    return change[type];
  }

  isEnrichedChange(change: any): boolean {
    return change && (change.from?.label || change.from?.name || change.from?.formatted);
  }

  formatAction(action: string): string {
    if (!action) return '';
    return action.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatFieldName(field: string): string {
    return field.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  formatStatus(status: string | any): string {
    if (!status) return 'Not Set';
    if (typeof status === 'object') return status.label || status.value || 'Unknown';
    
    const statusMap: {[key: string]: string} = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'in-review': 'In Review',
      'done': 'Done',
      'blocked': 'Blocked'
    };
    return statusMap[status] || status;
  }

  formatDate(date: any): string {
    if (!date) return 'Not set';
    
    if (date.formatted) return date.formatted;
    if (date.raw) return new Date(date.raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getUserName(user: any): string {
    if (!user) return 'Unassigned';
    if (typeof user === 'object') return user.name || user.email || 'Unknown';
    return user;
  }

  getDescriptionPreview(desc: any): string {
    if (!desc) return 'No description';
    
    if (desc.preview) return desc.preview;
    if (desc.full) return desc.full.substring(0, 100) + (desc.full.length > 100 ? '...' : '');
    
    return desc.substring(0, 100) + (desc.length > 100 ? '...' : '');
  }

  getActionClass(action: string): string {
    const actionMap: {[key: string]: string} = {
      'TASK_CREATED': 'created',
      'TASK_UPDATED': 'updated',
      'TASK_DELETED': 'deleted',
      'STATUS_CHANGED': 'status',
      'ASSIGNED_CHANGED': 'assigned',
      'PRIORITY_CHANGED': 'priority',
      'DUE_DATE_CHANGED': 'due-date',
      'DESCRIPTION_CHANGED': 'description',
      'TITLE_CHANGED': 'title',
      'COMMENT_ADDED': 'comment'
    };
    
    return actionMap[action] || 'default';
  }

  getDisplayFields(changes: any): string[] {
    if (!changes) return [];
    const order = ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate'];
    return Object.keys(changes)
      .filter(key => !['deletedAt', 'deletedBy'].includes(key))
      .sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }

  trackByFn(index: number, item: ActivityLog): string {
    return item._id || index.toString();
  }
}