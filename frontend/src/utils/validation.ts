export interface ValidationErrors {
  [key: string]: string;
}

export function validateTeamName(name: string): string | null {
  if (!name.trim()) return "Team name is required";
  if (name.trim().length < 2) return "Team name must be at least 2 characters";
  if (name.trim().length > 255) return "Team name must be less than 255 characters";
  return null;
}

export function validateProjectName(name: string): string | null {
  if (!name.trim()) return "Project name is required";
  if (name.trim().length < 2) return "Project name must be at least 2 characters";
  if (name.trim().length > 200) return "Project name must be less than 200 characters";
  return null;
}

export function validateTaskTitle(title: string): string | null {
  if (!title.trim()) return "Task title is required";
  if (title.trim().length < 2) return "Task title must be at least 2 characters";
  if (title.trim().length > 255) return "Task title must be less than 255 characters";
  return null;
}

export function validateSubtaskTitle(title: string): string | null {
  if (!title.trim()) return "Subtask title is required";
  return null;
}

export function validateCommentContent(content: string): string | null {
  if (!content.trim()) return "Comment cannot be empty";
  return null;
}

export function validateTeamMember(
  selectedUserId: number | null,
  existingMemberIds: number[]
): string | null {
  if (!selectedUserId) return "Please select a user";
  if (existingMemberIds.includes(selectedUserId)) {
    return "User is already a member of this team";
  }
  return null;
}

export function validateProjectTeamAssignment(
  selectedTeamId: string,
  assignedTeamIds: number[]
): string | null {
  if (!selectedTeamId) return "Please select a team";
  if (assignedTeamIds.includes(Number(selectedTeamId))) {
    return "Team is already assigned to this project";
  }
  return null;
}
