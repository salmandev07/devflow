import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";
import type { Toast as ToastType } from "../types";

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      iconColor: "text-emerald-500",
    },
    error: {
      icon: AlertTriangle,
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-200 dark:border-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      iconColor: "text-rose-500",
    },
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      iconColor: "text-blue-500",
    },
  };

  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-200 ${c.bg} ${c.border} ${
        exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      }`}
      style={{ minWidth: 280, maxWidth: 420 }}
    >
      <Icon size={16} className={`shrink-0 ${c.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${c.text}`}>{toast.message}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
