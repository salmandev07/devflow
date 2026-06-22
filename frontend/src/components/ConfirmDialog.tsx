import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import Button from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: "backdropIn 0.15s ease-out" }}
    >
      <div className="absolute inset-0 bg-slate-900/15 dark:bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${variant === "danger" ? "bg-rose-500/15" : "bg-indigo-500/15"}`}>
            <AlertTriangle size={22} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
