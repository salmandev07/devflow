import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Square, Clock, Calendar, User, FolderKanban, Users, AlertTriangle, Timer } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTask, startTimer, stopTimer, getTimerStatus, getTaskSessions } from "../../services/taskService";
import TaskComments from "../../components/TaskComments";
import TaskAttachments from "../../components/TaskAttachments";
import TaskSubtasks from "../../components/TaskSubtasks";
import { StatusBadge, PriorityBadge } from "../../components/Badge";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import { SkeletonTaskDetail } from "../../components/SkeletonLoader";
import { useToast } from "../../hooks/useToast";

type Task = {
  id: number; title: string; description: string; status: string; priority: string;
  estimated_hours: number; actual_hours: number; due_date?: string | null;
  project_name?: string; team_name?: string; assigned_username?: string;
};
type TimeSession = { id: number; username: string; started_at: string; ended_at: string | null; duration_hours: string };

function InfoRow({ icon: Icon, label, value, className = "" }: { icon: React.ElementType; label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-0">
      <Icon size={14} className="text-slate-500 dark:text-slate-500 shrink-0" />
      <span className="text-xs text-slate-500 dark:text-slate-500 w-24 shrink-0">{label}</span>
      <span className={`text-sm text-slate-800 dark:text-slate-200 ${className}`}>{value}</span>
    </div>
  );
}

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [timerLoading, setTimerLoading] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [data, status, sessionData] = await Promise.all([
          getTask(Number(id)), getTimerStatus(Number(id)), getTaskSessions(Number(id)),
        ]);
        setTask(data); setTimerRunning(status.running); setSessions(sessionData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    void load();
  }, [id]);

  const efficiency = task?.estimated_hours && task.estimated_hours > 0
    ? Math.round((task.actual_hours / task.estimated_hours) * 100) : 0;

  const handleStartTimer = async () => {
    if (!task) return;
    setTimerLoading(true);
    try { await startTimer(task.id); setTimerRunning(true); addToast("info", "Timer started"); }
    catch { addToast("error", "Unable to start timer"); }
    finally { setTimerLoading(false); }
  };

  const handleStopTimer = async () => {
    if (!task) return;
    setTimerLoading(true);
    try {
      const result = await stopTimer(task.id);
      setTimerRunning(false);
      const updated = await getTask(task.id);
      setTask(updated);
      setSessions(await getTaskSessions(task.id));
      addToast("success", `Added ${result.hours_added} hours`);
    } catch { addToast("error", "Unable to stop timer"); }
    finally { setTimerLoading(false); }
  };

  const isOverdue = task?.due_date && task.status !== "done" && new Date(task.due_date) < new Date();

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonTaskDetail />
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-slate-600 dark:text-slate-400">Task not found</p>
          <button onClick={() => navigate("/tasks")} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">Back to Tasks</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">
        <PageHeader
          title={task.title}
          subtitle={task.description || "No description"}
          breadcrumb={[
            { label: "Tasks", href: "/tasks" },
            { label: task.title },
          ]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          }
        />

        {/* Overdue banner */}
        {isOverdue && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <p className="text-sm text-rose-300">This task is overdue — due {task.due_date}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* ── Left: Main content ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Timer */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Timer size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Time Tracking</h3>
                </div>
                {timerRunning ? (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Timer Running
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-500">
                    Timer Stopped
                  </span>
                )}
              </div>
              <div className="flex gap-2 mb-4">
                <Button variant="success" size="sm" onClick={handleStartTimer} loading={timerLoading && !timerRunning}
                  icon={<Play size={13} />} disabled={timerRunning}>
                  Start
                </Button>
                <Button variant="danger" size="sm" onClick={handleStopTimer} loading={timerLoading && timerRunning}
                  icon={<Square size={13} />} disabled={!timerRunning}>
                  Stop
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/30 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">{task.estimated_hours}h</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Estimated</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/30 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">{task.actual_hours}h</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Actual</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/30 p-3 text-center">
                  <p className={`text-lg font-bold tabular-nums ${efficiency > 100 ? "text-rose-400" : "text-emerald-400"}`}>{efficiency}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Utilization</p>
                </div>
              </div>
            </div>

            {/* Session history */}
            {sessions.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Session History</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{session.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                          {new Date(session.started_at).toLocaleString()}
                          {session.ended_at ? ` → ${new Date(session.ended_at).toLocaleString()}` : ""}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${session.ended_at ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {session.ended_at ? `${session.duration_hours}h` : "Running…"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments, Attachments, Subtasks */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <TaskSubtasks taskId={task.id} />
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <TaskComments taskId={task.id} />
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <TaskAttachments taskId={task.id} />
            </div>
          </div>

          {/* ── Right: Sidebar metadata ── */}
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Details</h3>
              <div className="divide-y divide-slate-800/60">
                <InfoRow icon={User} label="Assignee" value={task.assigned_username ?? "Unassigned"} />
                <InfoRow icon={FolderKanban} label="Project" value={task.project_name ?? "—"} />
                <InfoRow icon={Users} label="Team" value={task.team_name ?? "—"} />
                <InfoRow icon={Calendar} label="Due Date" value={task.due_date ?? "No due date"}
                  className={isOverdue ? "text-rose-400" : ""} />
                <InfoRow icon={Clock} label="Estimated" value={`${task.estimated_hours}h`} />
                <InfoRow icon={Clock} label="Actual" value={`${task.actual_hours}h`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}