import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban, Users, ListTodo, Clock, CheckCircle2, AlertCircle, ExternalLink, Plus, X, Crown } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProject, getProjectTeams, createProjectTeam, assignTeamToProject, unassignTeamFromProject } from "../../services/projectService";
import { getTasks, createTask } from "../../services/taskService";
import { getTeams } from "../../services/teamService";
import { getTeamMembers, addTeamMember, deleteTeamMember } from "../../services/teamMembershipService";
import { getUsers } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge, PriorityBadge } from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Avatar from "../../components/Avatar";
import { SkeletonProjectDetails } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { validateProjectTeamAssignment, validateTeamName, validateTaskTitle } from "../../utils/validation";

type TeamSimple = { id: number; name: string; owner: number; project: number | null };
type ProjectTeam = { id: number; team: number; team_name: string; assigned_at: string };
type Project = { id: number; name: string; description: string; owner: number; created_at: string; assigned_teams: ProjectTeam[] };
type Task = { id: number; title: string; description: string; status: string; priority: string; project: number; assigned_to: number | null; assigned_username?: string; created_by: number | null };
type TeamMembership = { id: number; user: number; username: string; role: string };
type User = { id: number; username: string };

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTeams, setAllTeams] = useState<TeamSimple[]>([]);
  const [projectTeams, setProjectTeams] = useState<TeamSimple[]>([]);
  const [membershipsByTeam, setMembershipsByTeam] = useState<Record<number, TeamMembership[]>>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [unassignTarget, setUnassignTarget] = useState<ProjectTeam | null>(null);
  const [unassigning, setUnassigning] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskTeam, setTaskTeam] = useState("");
  const [taskAssignee, setTaskAssignee] = useState<number | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [addMemberTeam, setAddMemberTeam] = useState<number | null>(null);
  const [addMemberUser, setAddMemberUser] = useState("");
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{teamId: number; membershipId: number; username: string} | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  const { addToast } = useToast();
  const isOwner = profile?.user_id === project?.owner;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [proj, allTasks, teams, users] = await Promise.all([
          getProject(Number(id)),
          getTasks(),
          getTeams(),
          getUsers(),
        ]);
        if (cancelled) return;
        setProject(proj);
        setTasks(allTasks.filter((t: Task) => t.project === Number(id)));
        setAllTeams(teams);
        setAllUsers(users);
        const pTeams = await getProjectTeams(Number(id)).catch(() => []);
        setProjectTeams(pTeams);
        const memberships: Record<number, TeamMembership[]> = {};
        for (const t of pTeams) {
          try { memberships[t.id] = await getTeamMembers(t.id); } catch { memberships[t.id] = []; }
        }
        setMembershipsByTeam(memberships);
      } catch (err) { console.error(err); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const refreshTeams = async () => {
    const pTeams = await getProjectTeams(Number(id)).catch(() => []);
    setProjectTeams(pTeams);
    const memberships: Record<number, TeamMembership[]> = {};
    for (const t of pTeams) {
      try { memberships[t.id] = await getTeamMembers(t.id); } catch { memberships[t.id] = []; }
    }
    setMembershipsByTeam(memberships);
  };

  const handleAssign = async () => {
    if (!selectedTeamId || assigning) return;
    const assignedIds = project?.assigned_teams.map((pt) => pt.team) ?? [];
    const dupError = validateProjectTeamAssignment(selectedTeamId, assignedIds);
    if (dupError) { addToast("error", dupError); return; }
    setAssigning(true);
    try {
      const updated = await assignTeamToProject(Number(id), Number(selectedTeamId));
      setProject(updated);
      setSelectedTeamId("");
      addToast("success", "Team assigned to project");
      await refreshTeams();
    } catch (err) { addToast("error", "Failed to assign team"); console.error(err); }
    finally { setAssigning(false); }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) return;
    setUnassigning(true);
    try {
      const updated = await unassignTeamFromProject(Number(id), unassignTarget.team);
      setProject(updated);
      addToast("success", "Team removed from project");
      await refreshTeams();
    } catch (err) { addToast("error", "Failed to remove team"); console.error(err); }
    finally { setUnassigning(false); setUnassignTarget(null); }
  };

  const handleCreateTeam = async () => {
    const nameError = validateTeamName(teamName);
    if (nameError) { addToast("error", nameError); return; }
    setCreatingTeam(true);
    try {
      await createProjectTeam(Number(id), { name: teamName.trim() });
      setTeamName("");
      setCreateTeamOpen(false);
      addToast("success", "Team created successfully");
      await refreshTeams();
    } catch (err) { addToast("error", "Failed to create team"); console.error(err); }
    finally { setCreatingTeam(false); }
  };

  const handleAddMember = async (teamId: number) => {
    if (!addMemberUser) return;
    try {
      await addTeamMember(teamId, Number(addMemberUser), "developer");
      setAddMemberUser("");
      setAddMemberTeam(null);
      addToast("success", "Member added successfully");
      await refreshTeams();
    } catch (err) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to add member";
      if (data) {
        const messages: string[] = [];
        for (const [, value] of Object.entries(data)) {
          if (Array.isArray(value)) messages.push(value.join(", "));
          else if (typeof value === "string") messages.push(value);
        }
        if (messages.length > 0) msg = messages.join("; ");
      }
      addToast("error", msg);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmRemoveMember) return;
    setRemovingMember(true);
    try {
      await deleteTeamMember(confirmRemoveMember.membershipId);
      addToast("success", "Member removed successfully");
      await refreshTeams();
    } catch (err) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to remove member";
      if (data?.detail && typeof data.detail === "string") msg = data.detail;
      addToast("error", msg);
    } finally { setRemovingMember(false); setConfirmRemoveMember(null); }
  };

  const handleCreateTask = async () => {
    const titleError = validateTaskTitle(taskTitle);
    if (titleError) { addToast("error", titleError); return; }
    if (!taskTeam) { addToast("error", "Please select a team"); return; }
    setCreatingTask(true);
    try {
      await createTask({
        title: taskTitle.trim(),
        description: taskDesc,
        priority: taskPriority,
        project: Number(id),
        team: Number(taskTeam),
        assigned_to: taskAssignee,
        due_date: null,
        estimated_hours: 0,
      });
      setTaskTitle(""); setTaskDesc(""); setTaskPriority("medium"); setTaskTeam(""); setTaskAssignee(null);
      setCreateTaskOpen(false);
      addToast("success", "Task created successfully");
      const allTasks = await getTasks();
      setTasks(allTasks.filter((t: Task) => t.project === Number(id)));
    } catch (err) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to create task";
      if (data) {
        const messages: string[] = [];
        for (const [, value] of Object.entries(data)) {
          if (Array.isArray(value)) messages.push(value.join(", "));
          else if (typeof value === "string") messages.push(value);
        }
        if (messages.length > 0) msg = messages.join("; ");
      }
      addToast("error", msg);
    } finally { setCreatingTask(false); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonProjectDetails />
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <EmptyState icon={<FolderKanban size={32} />} title="Project not found" description="This project may have been deleted." />
      </DashboardLayout>
    );
  }

  const assignedTeamIds = new Set(project.assigned_teams.map((pt) => pt.team));
  const unassignedTeams = allTeams.filter((t) => !assignedTeamIds.has(t.id));
  const projectOwner = allUsers.find((u) => u.id === project.owner);

  const todoCount = tasks.filter(t => t.status === "todo").length;
  const progressCount = tasks.filter(t => t.status === "progress" || t.status === "in_progress").length;
  const doneCount = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const completionPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const stats = [
    { label: "Total Tasks", value: total, icon: <ListTodo size={18} />, color: "text-white", bg: "bg-slate-400/10" },
    { label: "To Do", value: todoCount, icon: <Clock size={18} />, color: "text-white", bg: "bg-amber-400/10" },
    { label: "In Progress", value: progressCount, icon: <AlertCircle size={18} />, color: "text-white", bg: "bg-blue-400/10" },
    { label: "Done", value: doneCount, icon: <CheckCircle2 size={18} />, color: "text-white", bg: "bg-emerald-400/10" },
  ];

  return (
    <DashboardLayout>
      <div className="page-enter">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-500 hover:text-indigo-400 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
              <FolderKanban size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
            {isOwner && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                <Crown size={12} />
                Owner
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 ml-[52px] max-w-2xl leading-relaxed">{project.description}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 ml-[52px]">
            Owner: {projectOwner?.username ?? `#${project.owner}`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion</span>
              <span className={`text-sm font-semibold ${completionPct === 100 ? "text-emerald-400" : "text-indigo-400"}`}>
                {completionPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${completionPct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Teams */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              Teams
              {projectTeams.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-xs font-medium text-indigo-400">
                  {projectTeams.length}
                </span>
              )}
            </h2>
            {isOwner && (
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setCreateTeamOpen(true)}>
                New Team
              </Button>
            )}
          </div>

          {projectTeams.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No teams yet" description={isOwner ? "Create a team to start collaborating." : "The project owner hasn't created any teams yet."} />
          ) : (
            <div className="space-y-4">
              {projectTeams.map((team) => {
                const members = membershipsByTeam[team.id] || [];
                const nonMembers = allUsers.filter(
                  (u) => !members.some((m) => m.user === u.id) && u.id !== team.owner
                );
                const teamOwner = allUsers.find((u) => u.id === team.owner);
                return (
                  <div key={team.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{team.name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          Owner: {teamOwner?.username ?? `#${team.owner}`}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => navigate(`/teams/${team.id}`)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Manage
                        </button>
                      )}
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {members.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-500 italic">No members yet</p>
                      ) : members.map((m) => (
                        <div key={m.id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 rounded-full pl-1 pr-2 py-0.5">
                          <Avatar name={m.username} size="xs" />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{m.username}</span>
                          {m.user === team.owner && (
                            <Crown size={10} className="text-amber-400 ml-0.5" />
                          )}
                          {isOwner && m.user !== team.owner && (
                            <button
                              onClick={() => setConfirmRemoveMember({ teamId: team.id, membershipId: m.id, username: m.username })}
                              className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add member — owner only */}
                    {isOwner && nonMembers.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          value={addMemberTeam === team.id ? addMemberUser : ""}
                          onChange={(e) => { setAddMemberTeam(team.id); setAddMemberUser(e.target.value); }}
                          className="rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 px-2 py-1.5 outline-none focus:border-indigo-500"
                        >
                          <option value="">+ Add member…</option>
                          {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </select>
                        {addMemberTeam === team.id && addMemberUser && (
                          <Button variant="primary" size="sm" onClick={() => handleAddMember(team.id)}>
                            Add
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assign existing teams (backward compat) */}
        {isOwner && unassignedTeams.length > 0 && (
          <div className="mb-8 flex items-center gap-2">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">Assign existing team…</option>
              {unassignedTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <Button
              variant="primary" size="sm" icon={<Plus size={13} />}
              onClick={handleAssign} loading={assigning} disabled={!selectedTeamId}
            >
              Assign
            </Button>
          </div>
        )}

        {/* Unassigned teams list (backward compat) */}
        {project.assigned_teams.filter(pt => !projectTeams.some(t => t.id === pt.team)).length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Legacy Teams</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.assigned_teams.filter(pt => !projectTeams.some(t => t.id === pt.team)).map((pt) => (
                <div key={pt.id} className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{pt.team_name}</span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setUnassignTarget(pt)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListTodo size={18} className="text-indigo-400" />
              Project Tasks
            </h2>
            {isOwner && (
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setCreateTaskOpen(true)}>
                New Task
              </Button>
            )}
          </div>
          {tasks.length === 0 ? (
            <EmptyState icon={<ListTodo size={28} />} title="No tasks" description={isOwner ? "Create a task to start tracking work." : "No tasks have been created yet."} />
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-500">{task.assigned_username || "Unassigned"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal open={createTeamOpen} onClose={() => { setCreateTeamOpen(false); setTeamName(""); }} title="Create Team in Project">
        <div className="space-y-4">
          <Input label="Team Name" placeholder="e.g. Backend Engineers" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setCreateTeamOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={creatingTeam} onClick={handleCreateTeam} icon={<Plus size={14} />}>Create Team</Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal open={createTaskOpen} onClose={() => { setCreateTaskOpen(false); setTaskTitle(""); setTaskDesc(""); setTaskPriority("medium"); setTaskTeam(""); setTaskAssignee(null); }} title="New Task" size="lg">
        <div className="space-y-4">
          <Input label="Task Title" placeholder="e.g. Implement authentication flow" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea placeholder="Describe what needs to be done…" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3}
              className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none resize-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Team</label>
              <select value={taskTeam} onChange={(e) => setTaskTeam(e.target.value)}
                className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 outline-none transition-all"
              >
                <option value="">Select Team</option>
                {projectTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={creatingTask} onClick={handleCreateTask} icon={<Plus size={14} />}>Create Task</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={unassignTarget !== null}
        onClose={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
        title="Remove Team from Project"
        message={`Are you sure you want to remove "${unassignTarget?.team_name ?? "this team"}" from this project?`}
        confirmLabel="Remove"
        loading={unassigning}
      />

      <ConfirmDialog
        open={confirmRemoveMember !== null}
        onClose={() => setConfirmRemoveMember(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmRemoveMember?.username ?? "this member"} from the team?`}
        confirmLabel="Remove"
        loading={removingMember}
      />
    </DashboardLayout>
  );
}
