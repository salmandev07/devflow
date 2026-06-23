import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import TaskStatusChart from "../../components/TaskStatusChart";
import TaskPriorityChart from "../../components/TaskPriorityChart";
import ActivityFeed from "../../components/ActivityFeed";
import { StatusBadge, PriorityBadge } from "../../components/Badge";
import { SkeletonDashboard } from "../../components/SkeletonLoader";
import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { getAllSubtasks } from "../../services/subtaskService";
import { useTeams } from "../../hooks/useTeams";
import { useToast } from "../../hooks/useToast";
import {
  FolderKanban, Users, CheckSquare, CheckCircle2,
  Clock, ListTodo, TrendingUp, AlertTriangle,
  CalendarClock, ArrowRight, RefreshCw,
} from "lucide-react";

type Task = {
  id: number; title: string; status: string; priority: string;
  estimated_hours: number;
  assigned_to_username?: string; due_date?: string | null;
};
type Subtask = { id: number; completed: boolean };

function getUsernameFromToken(): string {
  return localStorage.getItem("username") || "there";
}

function StatCard({
  label, value, icon: Icon, bg, description, onClick,
}: {
  label: string; value: string | number; icon: React.ElementType;
  bg: string; description?: string; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all duration-200 group text-left w-full ${
        onClick
          ? "hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-md cursor-pointer"
          : "hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{description}</p>}
    </button>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(d: string): number {
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const { teamCount, loading: teamsLoading } = useTeams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const username = getUsernameFromToken();

  const load = useCallback(async (isRetry = false) => {
    if (isRetry) setRetrying(true);
    try {
      setError(null);
      const [projects, taskData, allSubtasks] = await Promise.all([
        getProjects(), getTasks(), getAllSubtasks(),
      ]);
      setProjectCount(projects.length);
      setTasks(taskData);
      setSubtasks(allSubtasks);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
      addToast("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [addToast]);

useEffect(() => {
  const initialize = async () => {
    await load();
  };

  void initialize();
}, [load]);

  // Memoized derived metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const progressTasks = tasks.filter((t) => t.status === "progress").length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;
    const lowPrio = tasks.filter((t) => t.priority === "low").length;
    const mediumPrio = tasks.filter((t) => t.priority === "medium").length;
    const highPrio = tasks.filter((t) => t.priority === "high").length;

    const totalEst = tasks.reduce((s, t) => s + Number(t.estimated_hours || 0), 0);

    const completedSubs = subtasks.filter((s) => s.completed).length;
    const subtaskPct = subtasks.length > 0 ? Math.round((completedSubs / subtasks.length) * 100) : 0;

    const now = new Date();
    const upcomingTasks = tasks
      .filter((t) => t.due_date && t.status !== "done")
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);

    const overdueTasks = tasks.filter(
      (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < now,
    );

    return {
      totalTasks, completedTasks, progressTasks, todoTasks,
      lowPrio, mediumPrio, highPrio,
      totalEst, subtaskPct,
      upcomingTasks, overdueTasks,
    };
  }, [tasks, subtasks]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Error state with retry
  if (error && !loading) {
    return (
      <DashboardLayout>
        <div className="page-enter flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs mb-5">{error}</p>
          <button
            onClick={() => void load(true)}
            disabled={retrying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {retrying ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <RefreshCw size={14} />
            )}
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">

        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {username}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">{today} · Here's your workspace overview</p>
          </div>
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            View Tasks <ArrowRight size={14} />
          </button>
        </div>

        {loading || teamsLoading ? (
          <SkeletonDashboard />
        ) : (
          <>
            {/* Row 1 — Core stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Projects"   value={projectCount}  icon={FolderKanban}  bg="bg-indigo-600" description="Active projects" onClick={() => navigate("/projects")} />
              <StatCard label="Teams"      value={teamCount}     icon={Users}         bg="bg-violet-600" description="Collaborating teams" onClick={() => navigate("/teams")} />
              <StatCard label="Total Tasks" value={metrics.totalTasks}   icon={CheckSquare}   bg="bg-sky-600"    description="All tasks tracked" onClick={() => navigate("/tasks")} />
              <StatCard label="Completed"  value={metrics.completedTasks} icon={CheckCircle2} bg="bg-emerald-600" description={`${metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}% completion rate`} onClick={() => navigate("/tasks")} />
            </div>

            {/* Row 2 — Secondary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="In Progress" value={metrics.progressTasks}  icon={Clock}        bg="bg-amber-600"  description="Active tasks" onClick={() => navigate("/tasks")} />
              <StatCard label="To Do"       value={metrics.todoTasks}       icon={ListTodo}     bg="bg-slate-300 dark:bg-slate-600" description="Pending tasks" onClick={() => navigate("/tasks")} />
              <StatCard label="Est. Hours"  value={`${metrics.totalEst.toFixed(1)}h`} icon={CalendarClock} bg="bg-blue-600" description="Estimated total" />
              <StatCard label="Tasks" value={metrics.totalTasks} icon={TrendingUp} bg="bg-indigo-600" description="Total tasks" onClick={() => navigate("/tasks")} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaskStatusChart todo={metrics.todoTasks} inProgress={metrics.progressTasks} done={metrics.completedTasks} />
              <TaskPriorityChart low={metrics.lowPrio} medium={metrics.mediumPrio} high={metrics.highPrio} />
            </div>

            {/* Overdue Alert — enhanced */}
            {metrics.overdueTasks.length > 0 && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/3 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                      <AlertTriangle size={14} className="text-rose-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-rose-400">
                      {metrics.overdueTasks.length} Overdue {metrics.overdueTasks.length === 1 ? "Task" : "Tasks"}
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {metrics.overdueTasks.slice(0, 5).map((task) => {
                    const days = daysUntil(task.due_date!);
                    return (
                      <div
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="flex items-center justify-between rounded-lg border border-rose-500/10 bg-rose-500/5 px-4 py-2.5 cursor-pointer hover:bg-rose-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusBadge status={task.status} />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
                        </div>
                        <span className="text-xs text-rose-400 shrink-0 ml-2 font-medium">
                          {days === 0 ? "Due today" : `${Math.abs(days)}d overdue`}
                        </span>
                      </div>
                    );
                  })}
                  {metrics.overdueTasks.length > 5 && (
                    <p className="text-xs text-rose-400/60 text-center pt-1">
                      +{metrics.overdueTasks.length - 5} more overdue
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={15} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
                  </div>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight size={12} />
                  </button>
                </div>
                {metrics.upcomingTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-500 py-6 text-center">No upcoming deadlines</p>
                ) : (
                  <div className="space-y-2">
                    {metrics.upcomingTasks.map((task) => {
                      const days = daysUntil(task.due_date!);
                      const isUrgent = days <= 2 && days >= 0;
                      return (
                        <div
                          key={task.id}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="flex items-center justify-between rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2.5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <StatusBadge status={task.status} />
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:hover:text-slate-100">{task.title}</span>
                          </div>
                          <span className={`text-xs shrink-0 ml-2 font-medium ${isUrgent ? "text-amber-400" : "text-slate-500 dark:text-slate-500"}`}>
                            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : formatDate(task.due_date!)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <ActivityFeed />
            </div>

            {/* Recent Tasks */}
            {tasks.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Tasks</h3>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight size={12} />
                  </button>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                        {task.assigned_to_username && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{task.assigned_to_username}</p>
                        )}
                      </div>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      {task.due_date && (
                        <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-500 shrink-0">{formatDate(task.due_date)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
