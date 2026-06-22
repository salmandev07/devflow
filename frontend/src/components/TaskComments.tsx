import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { getComments, createComment, deleteComment } from "../services/commentService";
import { useToast } from "../hooks/useToast";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";

type Props = { taskId: number };

type Comment = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskComments({ taskId }: Props) {
  const { addToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setComments(await getComments(taskId)); }
      catch (err) { console.error(err); addToast("error", "Failed to load comments"); }
      finally { setLoading(false); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadComments = async () => {
    try { setComments(await getComments(taskId)); }
    catch (err) { console.error(err); addToast("error", "Failed to load comments"); }
  };

  const handleAdd = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment(taskId, content);
      setContent("");
      await loadComments();
    } catch (err) { console.error(err); addToast("error", "Failed to add comment"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteComment(confirmDeleteId);
      setComments((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    } catch (err) { console.error(err); addToast("error", "Failed to delete comment"); }
    finally { setDeleting(false); setConfirmDeleteId(null); }
  };

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare size={18} className="text-indigo-400" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Comments</h2>
        {comments.length > 0 && (
          <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-xs font-medium text-indigo-400">
            {comments.length}
          </span>
        )}
      </div>

      {/* Compose */}
      <div className="flex gap-3 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleAdd(); } }}
          placeholder="Write a comment…"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!content.trim() || submitting}
          className="self-end flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2 w-16" />
                </div>
              </div>
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <MessageSquare size={28} className="text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-500">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.username} size="sm" />
                  <div>
                    <span className="text-sm font-medium text-indigo-400">{c.username}</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-500">{formatTime(c.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDeleteId(c.id)}
                  disabled={deleting && confirmDeleteId === c.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 dark:text-slate-500 hover:text-rose-400 transition-all disabled:opacity-50"
                >
                  {deleting && confirmDeleteId === c.id ? (
                    <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
              <p className="mt-2.5 pl-11 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}