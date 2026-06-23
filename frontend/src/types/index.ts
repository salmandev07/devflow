export interface User {
  id: number;
  username: string;
}

export interface Team {
  id: number;
  name: string;
  owner: number;
  members: number[];
  created_at?: string;
}

export interface TeamMembership {
  id: number;
  team: number;
  user: number;
  username: string;
  role: "lead" | "developer" | "tester" | "designer";
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: number;
  created_at: string;
  assigned_teams: ProjectTeam[];
}

export interface ProjectTeam {
  id: number;
  team: number;
  team_name: string;
  assigned_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "progress" | "done";
  priority: "low" | "medium" | "high";
  project: number;
  project_name: string;
  team: number | null;
  team_name: string | null;
  assigned_to: number | null;
  assigned_username: string | null;
  due_date: string | null;
  estimated_hours: string;
  created_at: string;
}

export interface Subtask {
  id: number;
  task: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  task: number;
  user: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  task: number;
  file: string;
  filename: string;
  uploaded_at: string;
}

export interface Activity {
  id: number;
  username: string;
  action: "create" | "update" | "delete" | "move";
  message: string;
  created_at: string;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
}

export interface TimeSession {
  id: number;
  task: number;
  user: number;
  username: string;
  started_at: string;
  ended_at: string | null;
  duration_hours: string;
}

export interface ProjectReport {
  project: string;
  total_tasks: number;
  completed: number;
  progress: number;
  todo: number;
  estimated_hours: number;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
