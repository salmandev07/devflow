import { useEffect, useState } from "react";
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
import {
  FolderKanban, Users, CheckSquare, CheckCircle2,
  Clock, ListTodo, TrendingUp, AlertTriangle,
  CalendarClock, ArrowRight,
} from "lucide-react";

type Task = {
  id: number; title: string; status: string; priority: string;
  estimated_hours: string; actual_hours: string;
  assigned_to_username?: string; due_date?: string | null;
};
type Subtask = { id: number; completed: boolean };

function getUsernameFromToken(): string {
  try {
    const t = localStorage.getItem("accessToken");
    if (!t) return "there";
    return JSON.parse(atob(t.split(".")[1])).username || "there";
  } catch { return "there"; }
}

function StatCard({
  label, value, icon: Icon, bg, description,
}: { label: string; value: string | number; icon: React.ElementType; bg: string; description?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{description}</p>}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const { teamCount, loading: teamsLoading } = useTeams();
  const navigate = useNavigate();
  const username = getUsernameFromToken();

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, taskData, allSubtasks] = await Promise.all([
          getProjects(), getTasks(), getAllSubtasks(),
        ]);
        setProjectCount(projects.length);
        setTasks(taskData);
        setSubtasks(allSubtasks);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  // Derived metrics
  const totalTasks = tasks.length;
  const completedTasks  = tasks.filter((t) => t.status === "done").length;
  const progressTasks   = tasks.filter((t) => t.status === "progress").length;
  const todoTasks       = tasks.filter((t) => t.status === "todo").length;
  const lowPrio    = tasks.filter((t) => t.priority === "low").length;
  const mediumPrio = tasks.filter((t) => t.priority === "medium").length;
  const highPrio   = tasks.filter((t) => t.priority === "high").length;

  const totalEst = tasks.reduce((s, t) => s + Number(t.estimated_hours || 0), 0);
  const totalAct = tasks.reduce((s, t) => s + Number(t.actual_hours || 0), 0);
  const productivity = totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 0;

  const completedSubs = subtasks.filter((s) => s.completed).length;
  const subtaskPct = subtasks.length > 0 ? Math.round((completedSubs / subtasks.length) * 100) : 0;

  const now = new Date();
  const upcomingTasks = tasks
    .filter((t) => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < now,
  );

  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">

        {/* ── Welcome Banner ── */}
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, {username} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">{today} · Here's your workspace overview</p>
          </div>
          <button
            onClick={() => navigate("/tasks")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            View Tasks <ArrowRight size={14} />
          </button>
        </div>

        {loading || teamsLoading ? (
          <SkeletonDashboard />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Projects"   value={projectCount}  icon={FolderKanban}  bg="bg-indigo-600" description="Active projects" />
              <StatCard label="Teams"      value={teamCount}     icon={Users}         bg="bg-violet-600" description="Collaborating teams" />
              <StatCard label="Total Tasks" value={totalTasks}   icon={CheckSquare}   bg="bg-sky-600"    description="All tasks tracked" />
              <StatCard label="Completed"  value={completedTasks} icon={CheckCircle2} bg="bg-emerald-600" description={`${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}% completion rate`} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="In Progress" value={progressTasks}  icon={Clock}        bg="bg-amber-600"  description="Active tasks" />
              <StatCard label="To Do"       value={todoTasks}       icon={ListTodo}     bg="bg-slate-300 dark:bg-slate-600"  description="Pending tasks" />
              <StatCard label="Est. Hours"  value={`${totalEst.toFixed(1)}h`} icon={CalendarClock} bg="bg-blue-600" description={`${totalAct.toFixed(1)}h actual`} />
              <StatCard label="Productivity" value={`${productivity}%`} icon={TrendingUp} bg="bg-indigo-600" description={`Subtask completion: ${subtaskPct}%`} />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4">
              <TaskStatusChart todo={todoTasks} inProgress={progressTasks} done={completedTasks} />
              <TaskPriorityChart low={lowPrio} medium={mediumPrio} high={highPrio} />
            </div>

            {/* Overdue Alert */}
            {overdueTasks.length > 0 && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-rose-400" />
                  <h2 className="text-sm font-semibold text-rose-300">
                    {overdueTasks.length} Overdue {overdueTasks.length === 1 ? "Task" : "Tasks"}
                  </h2>
                </div>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex items-center justify-between rounded-lg border border-rose-500/10 bg-rose-500/5 px-4 py-2.5 cursor-pointer hover:bg-rose-500/10 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                      <span className="text-xs text-rose-400">Due {formatDate(task.due_date!)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming + Activity */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarClock size={15} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
                </div>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-500 py-6 text-center">No upcoming deadlines</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingTasks.map((task) => {
                      const isOverdue = new Date(task.due_date!) < now && task.status !== "done";
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
                          <span className={`text-xs shrink-0 ml-2 font-medium ${isOverdue ? "text-rose-400" : "text-slate-500 dark:text-slate-500"}`}>
                            {formatDate(task.due_date!)}
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
                <div className="divide-y divide-slate-800/60">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
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