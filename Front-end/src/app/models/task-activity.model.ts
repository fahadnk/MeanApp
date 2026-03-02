export interface TaskActivity {
  _id: string;
  action: string;
  performedBy: {
    name: string;
    email: string;
    role: string;
  };
  changes: any;
  createdAt: string;
}