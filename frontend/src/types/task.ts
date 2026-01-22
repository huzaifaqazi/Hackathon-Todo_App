export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // ISO string format
  user_id: string;
  created_at: string;
  updated_at: string;
}