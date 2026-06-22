import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban, Users, ListTodo, Clock, CheckCircle2, AlertCircle, ExternalLink, Plus, X } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProject, assignTeamToProject, unassignTeamFromProject } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { getTeams } from "../../services/teamService";
import { StatusBadge, PriorityBadge } from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";
import { SkeletonProjectDetails } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { validateProjectTeamAssignment } from "../../utils/validation";

type TeamSimple = { id: number; name: string };
type ProjectTeam = { id: number; team: number; team_name: string; assigned_at: string };
type Project = { id: number; name: string; description: string; created_at: string; assigned_teams: ProjectTeam[] };
type Task = { id: number; title: string; status: string; priority: string; project: number };

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTeams, setAllTeams] = useState<TeamSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [unassignTarget, setUnassignTarget] = useState<ProjectTeam | null>(null);
  const [unassigning, setUnassigning] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [proj, allTasks, teams] = await Promise.all([
          getProject(Number(id)),
          getTasks(),
          getTeams(),
        ]);
        if (cancelled) return;
        setProject(proj);
        setTasks(allTasks.filter((t: Task) => t.project === Number(id)));
        setAllTeams(teams);
      } catch (err) { console.error(err); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

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
    } catch (err) { addToast("error", "Failed to remove team"); console.error(err); }
    finally { setUnassigning(false); setUnassignTarget(null); }
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
          </div>
          {project.description && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 ml-[52px] max-w-2xl leading-relaxed">{project.description}</p>
          )}
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
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            Assigned Teams
            {project.assigned_teams.length > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-xs font-medium text-indigo-400">
                {project.assigned_teams.length}
              </span>
            )}
          </h2>

          {project.assigned_teams.length === 0 && unassignedTeams.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No teams available" description="Create a team first to assign it to this project." />
          ) : project.assigned_teams.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No teams assigned" description="Assign a team to this project to start collaborating." />
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {project.assigned_teams.map((pt) => (
                <div key={pt.id} className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-white text-sm font-bold">
                      {pt.team_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{pt.team_name}</span>
                  </div>
                  <button
                    onClick={() => setUnassignTarget(pt)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0"
                    title="Remove team from project"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assign team */}
          {unassignedTeams.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">Select a team…</option>
                {unassignedTeams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={handleAssign}
                loading={assigning}
                disabled={!selectedTeamId}
              >
                Assign
              </Button>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ListTodo size={18} className="text-indigo-400" />
            Project Tasks
          </h2>
          {tasks.length === 0 ? (
            <EmptyState icon={<ListTodo size={28} />} title="No tasks" description="This project has no tasks yet." />
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
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

      <ConfirmDialog
        open={unassignTarget !== null}
        onClose={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
        title="Remove Team from Project"
        message={`Are you sure you want to remove "${unassignTarget?.team_name ?? "this team"}" from this project? The team itself will not be deleted and can be reassigned later.`}
        confirmLabel="Remove"
        loading={unassigning}
      />
    </DashboardLayout>
  );
}
