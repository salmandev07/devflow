/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Trash2, Inbox, CheckCheckIcon,
  UserPlus, UserMinus, ClipboardCheck, MessageSquare,
  Paperclip, ListChecks, FileText, AlertCircle,
} from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type NotificationData,
} from "../services/notificationService";
import { useToast } from "../hooks/useToast";
import { SkeletonNotificationList } from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

const typeIcons: Record<string, React.ReactNode> = {
  task_assigned: <ClipboardCheck size={14} className="text-indigo-400" />,
  task_unassigned: <ClipboardCheck size={14} className="text-slate-400" />,
  task_status_changed: <FileText size={14} className="text-amber-400" />,
  task_completed: <ClipboardCheck size={14} className="text-emerald-400" />,
  comment_added: <MessageSquare size={14} className="text-blue-400" />,
  mention: <MessageSquare size={14} className="text-violet-400" />,
  attachment_added: <Paperclip size={14} className="text-cyan-400" />,
  team_member_added: <UserPlus size={14} className="text-emerald-400" />,
  team_member_removed: <UserMinus size={14} className="text-rose-400" />,
  project_created: <FileText size={14} className="text-indigo-400" />,
  subtask_completed: <ListChecks size={14} className="text-emerald-400" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationCenter() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const loadNotifications = useCallback(async () => {
    try {
      const params: { is_read?: boolean; page?: number } = { page };
      if (filter === "unread") params.is_read = false;
      else if (filter === "read") params.is_read = true;

      const data = await getNotifications(params);
      setNotifications(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter, page, addToast]);

  useEffect(() => {
    setLoading(true);
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };
    const handleFocus = () => {
      void loadNotifications();
    };
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadNotifications]);

  const handleRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      addToast("success", "All notifications marked as read");
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to mark all as read");
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to delete notification");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleClick = (n: NotificationData) => {
    if (!n.is_read) void handleRead(n.id);
    if (n.url) navigate(n.url);
  };

  const unread = notifications.filter((n) => !n.is_read).length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Bell size={22} className="text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
            {unread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-xs font-semibold text-indigo-400">
                {unread}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5 ml-8">
            {totalCount > 0 ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>

        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
          >
            <CheckCheckIcon size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
        {(["all", "unread", "read"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === tab
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <SkeletonNotificationList />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <Inbox size={28} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">No notifications</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
            {filter === "unread" ? "You're all caught up!" : filter === "read" ? "No read notifications yet." : "New notifications will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`
                  group flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer
                  ${n.is_read
                    ? "border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40"
                    : "border-indigo-500/20 bg-indigo-500/[0.03]"
                  }
                  hover:border-slate-300 dark:hover:border-slate-700
                `}
              >
                {/* Type icon */}
                <div className="mt-1 shrink-0">
                  {typeIcons[n.notification_type] || <AlertCircle size={14} className="text-slate-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${n.is_read ? "text-slate-500 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); void handleRead(n.id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                      title="Mark as read"
                    >
                      <CheckCheck size={15} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(n.id); }}
                    disabled={deleting && confirmDeleteId === n.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting && confirmDeleteId === n.id ? (
                      <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                    ) : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
