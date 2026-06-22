import { useEffect, useState } from "react";
import { ListChecks, Plus, Trash2, Check } from "lucide-react";
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask } from "../services/subtaskService";
import { useToast } from "../hooks/useToast";
import ConfirmDialog from "./ConfirmDialog";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Props {
  taskId: number;
}

export default function TaskSubtasks({ taskId }: Props) {
  const { addToast } = useToast();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setSubtasks(await getSubtasks(taskId)); }
      catch (err) { console.error(err); addToast("error", "Failed to load subtasks"); }
      finally { setLoading(false); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadSubtasks = async () => {
    try { setSubtasks(await getSubtasks(taskId)); }
    catch (err) { console.error(err); addToast("error", "Failed to load subtasks"); }
  };

  const handleCreate = async () => {
    if (!title.trim() || adding) return;
    setAdding(true);
    try {
      await createSubtask(taskId, title);
      setTitle("");
      await loadSubtasks();
    } catch (err) { console.error(err); addToast("error", "Failed to create subtask"); }
    finally { setAdding(false); }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try { await updateSubtask(id, { completed: !completed }); await loadSubtasks(); }
    catch (err) { console.error(err); addToast("error", "Failed to update subtask"); }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteSubtask(confirmDeleteId);
      setSubtasks((prev) => prev.filter((s) => s.id !== confirmDeleteId));
    } catch (err) { console.error(err); addToast("error", "Failed to delete subtask"); }
    finally { setDeleting(false); setConfirmDeleteId(null); }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length === 0 ? 0 : Math.round((completedCount / subtasks.length) * 100);

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <ListChecks size={18} className="text-indigo-400" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Subtasks</h2>
        {subtasks.length > 0 && (
          <span className="ml-1 text-xs text-slate-500 dark:text-slate-500">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-500">Progress</span>
            <span className={`text-xs font-medium ${progress === 100 ? "text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add subtask */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
          placeholder="Add a subtask…"
          className="flex-1 rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <button
          onClick={handleCreate}
          disabled={!title.trim() || adding}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Subtask list */}
      {loading ? (
        <div className="space-y-1.5">
          {[1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3">
              <div className="skeleton h-5 w-5 rounded-md shrink-0" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : subtasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <ListChecks size={28} className="text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-500">No subtasks yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {subtasks.map((s) => (
            <div
              key={s.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(s.id, s.completed)}
                className={`
                  flex items-center justify-center h-5 w-5 rounded-md border transition-all shrink-0
                  ${s.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-600 hover:border-indigo-500"
                  }
                `}
              >
                {s.completed && <Check size={12} strokeWidth={3} />}
              </button>

              {/* Title */}
              <span className={`flex-1 text-sm transition-all ${s.completed ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                {s.title}
              </span>

              {/* Delete */}
              <button
                onClick={() => setConfirmDeleteId(s.id)}
                disabled={deleting && confirmDeleteId === s.id}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 dark:text-slate-500 hover:text-rose-400 transition-all disabled:opacity-50"
              >
                {deleting && confirmDeleteId === s.id ? (
                  <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subtask"
        message="Are you sure you want to delete this subtask? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}