type StatusType = "todo" | "progress" | "done" | "in_progress";
type PriorityType = "low" | "medium" | "high";

interface BadgeProps {
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  todo: {
    label: "To Do",
    className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
  done: {
    label: "Done",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

const priorityConfig: Record<PriorityType, { label: string; className: string; dot: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    dot: "bg-rose-400",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StatusType] ?? statusConfig.todo;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as PriorityType] ?? priorityConfig.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function Badge({ label = "", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ${className}`}>
      {label}
    </span>
  );
}
