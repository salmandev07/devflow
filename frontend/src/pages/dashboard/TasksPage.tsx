import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, ExternalLink, ChevronDown, CheckSquare, SlidersHorizontal } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTasks, createTask, updateTask, deleteTask } from "../../services/taskService";
import { getProjects } from "../../services/projectService";
import { getTeams } from "../../services/teamService";
import { getTeamMembers } from "../../services/teamMembershipService";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { StatusBadge, PriorityBadge } from "../../components/Badge";
import Avatar from "../../components/Avatar";
import { SkeletonList } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { validateTaskTitle } from "../../utils/validation";

type Task = {
  id: number; title: string; description: string; status: string; priority: string;
  project: number; project_name?: string; team: number; team_name?: string;
  assigned_to: number | null; assigned_username?: string;
  estimated_hours: number; actual_hours: number; due_date: string | null;
};
type Project = { id: number; name: string };
type Team = { id: number; name: string };
type TeamMembership = { id: number; user: number; username: string; role: string };

function SelectField({ label, value, onChange, children, disabled }: {
  label?: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 pr-8 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [actualHours, setActualHours] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, projectData, teamData] = await Promise.all([
          getTasks(), getProjects(), getTeams(),
        ]);
        setTasks(taskData);
        setProjects(projectData); setTeams(teamData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedTeam) { setTeamMembers([]); return; }
      try { setTeamMembers(await getTeamMembers(Number(selectedTeam))); }
      catch (err) { console.error(err); }
    };
    void loadMembers();
  }, [selectedTeam]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setPriority("medium");
    setAssignedTo(null); setDueDate(""); setSelectedProject("");
    setSelectedTeam(""); setEstimatedHours(""); setActualHours("");
    setEditingTask(null); setFormError("");
  };

  const openCreate = () => { resetForm(); setModalOpen(true); };
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title); setDescription(task.description);
    setPriority(task.priority); setAssignedTo(task.assigned_to);
    setDueDate(task.due_date ?? "");
    setSelectedProject(String(task.project));
    setSelectedTeam(String(task.team));
    setEstimatedHours(String(task.estimated_hours));
    setActualHours(String(task.actual_hours));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const titleError = validateTaskTitle(title);
    if (titleError) { setFormError(titleError); return; }
    if (!editingTask && !selectedProject) { setFormError("Please select a project"); return; }
    if (!editingTask && !selectedTeam) { setFormError("Please select a team"); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title, description, priority,
          due_date: dueDate || null, assigned_to: assignedTo,
          estimated_hours: Number(estimatedHours) || 0,
          actual_hours: Number(actualHours) || 0,
        });
        addToast("success", "Task updated successfully");
      } else {
        await createTask({
          title, description, priority,
          due_date: dueDate || null,
          project: Number(selectedProject), team: Number(selectedTeam),
          assigned_to: assignedTo,
          estimated_hours: Number(estimatedHours) || 0,
          actual_hours: Number(actualHours) || 0,
        });
        addToast("success", "Task created successfully");
      }
      setTasks(await getTasks());
      setModalOpen(false); resetForm();
    } catch (err: unknown) {
      let msg = "Failed to save task";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data) {
          const messages: string[] = [];
          for (const [field, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              messages.push(`${field}: ${value.join(", ")}`);
            } else if (typeof value === "string") {
              messages.push(value);
            }
          }
          if (messages.length > 0) msg = messages.join("; ");
        }
      }
      setFormError(msg);
      addToast("error", msg);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast("success", "Task deleted successfully");
    } catch (err) { addToast("error", "Failed to delete task"); console.error(err); }
    finally { setDeleting(false); setConfirmDeleteId(null); }
  };

  const now = new Date();
  const filtered = tasks.filter((task) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = task.title.toLowerCase().includes(s) || task.description.toLowerCase().includes(s);
    const matchProject = !filterProject || task.project === Number(filterProject);
    const matchTeam = !filterTeam || task.team === Number(filterTeam);
    const matchStatus = !filterStatus || task.status === filterStatus;
    const matchPriority = !filterPriority || task.priority === filterPriority;
    return matchSearch && matchProject && matchTeam && matchStatus && matchPriority;
  });

  const activeFilters = [filterProject, filterTeam, filterStatus, filterPriority].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="page-enter space-y-5">
        <PageHeader
          title="Tasks"
          subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
          action={
            <Button variant="primary" size="md" icon={<Plus size={15} />} onClick={openCreate}>
              New Task
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-50">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
            <input placeholder="Search tasks…" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {[
            { value: filterProject, set: setFilterProject, opts: projects.map(p => ({ v: String(p.id), l: p.name })), placeholder: "All Projects" },
            { value: filterTeam, set: setFilterTeam, opts: teams.map(t => ({ v: String(t.id), l: t.name })), placeholder: "All Teams" },
            { value: filterStatus, set: setFilterStatus, opts: [{ v: "todo", l: "To Do" }, { v: "progress", l: "In Progress" }, { v: "done", l: "Done" }], placeholder: "All Statuses" },
            { value: filterPriority, set: setFilterPriority, opts: [{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }], placeholder: "All Priorities" },
          ].map(({ value, set, opts, placeholder }, i) => (
            <div key={i} className="relative">
              <select value={value} onChange={(e) => set(e.target.value)}
                className="appearance-none rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-600 dark:text-slate-400 text-sm pl-3 pr-7 py-2 outline-none transition-all cursor-pointer">
                <option value="">{placeholder}</option>
                {opts.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
            </div>
          ))}
          {activeFilters > 0 && (
            <button onClick={() => { setFilterProject(""); setFilterTeam(""); setFilterStatus(""); setFilterPriority(""); }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <SlidersHorizontal size={12} /> Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
          <EmptyState icon={<CheckSquare size={24} />}
            title={searchTerm || activeFilters > 0 ? "No tasks match your filters" : "No tasks yet"}
            description={searchTerm || activeFilters > 0 ? "Adjust your filters or search term" : "Create your first task to start tracking work"}
            action={!searchTerm && activeFilters === 0 ? (
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={openCreate}>New Task</Button>
            ) : undefined}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50">
              {["Task", "Project", "Priority", "Status", "Assignee", "Due Date", ""].map((h, i) => (
                <span key={i} className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {/* Rows */}
            <div className="divide-y divide-slate-800/60">
              {filtered.map((task) => {
                const overdue = task.due_date && new Date(task.due_date) < now && task.status !== "done";
                return (
                  <div key={task.id}
                    className="group grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Title */}
                    <div className="min-w-0">
                      <button onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-400 transition-colors text-left truncate block max-w-full">
                        {task.title}
                      </button>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                    {/* Project */}
                    <span className="hidden md:block text-xs text-slate-600 dark:text-slate-400 truncate">{task.project_name || "—"}</span>
                    {/* Priority */}
                    <div className="hidden md:block"><PriorityBadge priority={task.priority} /></div>
                    {/* Status */}
                    <div className="hidden md:block"><StatusBadge status={task.status} /></div>
                    {/* Assignee */}
                    <div className="hidden md:flex items-center gap-2">
                      {task.assigned_username ? (
                        <>
                          <Avatar name={task.assigned_username} size="xs" />
                          <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{task.assigned_username}</span>
                        </>
                      ) : <span className="text-xs text-slate-600 dark:text-slate-400">Unassigned</span>}
                    </div>
                    {/* Due date */}
                    <span className={`hidden md:block text-xs font-medium ${overdue ? "text-rose-400" : "text-slate-500 dark:text-slate-500"}`}>
                      {formatDate(task.due_date)}
                    </span>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/tasks/${task.id}`)}
                        title="Open" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ExternalLink size={13} />
                      </button>
                      <button onClick={() => openEdit(task)}
                        title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(task.id)}
                        title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingTask ? "Edit Task" : "New Task"} size="lg">
        <div className="space-y-4">
          {formError && (
            <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{formError}</div>
          )}
          <Input label="Task Title" placeholder="e.g. Implement authentication flow" value={title}
            onChange={(e) => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea placeholder="Describe what needs to be done…" value={description}
              onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none resize-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Priority" value={priority} onChange={setPriority}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectField>
            <SelectField label="Project" value={selectedProject} onChange={setSelectedProject} disabled={!!editingTask}>
              <option value="">Select Project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </SelectField>
            <SelectField label="Team" value={selectedTeam} onChange={setSelectedTeam} disabled={!!editingTask}>
              <option value="">Select Team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </SelectField>
            <SelectField label="Assignee" value={assignedTo != null ? String(assignedTo) : ""}
              onChange={(v) => setAssignedTo(v ? Number(v) : null)}>
              <option value="">Unassigned</option>
              {teamMembers.map((m) => <option key={m.id} value={m.user}>{m.username}</option>)}
            </SelectField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Input label="Est. Hours" type="number" placeholder="0" value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)} />
            <Input label="Actual Hours" type="number" placeholder="0" value={actualHours}
              onChange={(e) => setActualHours(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => { setModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Task"
        message="This will permanently delete this task and all its subtasks, comments, and attachments. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </DashboardLayout>
  );
}