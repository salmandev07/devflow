import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, Inbox } from "lucide-react";
import { getNotifications, markAsRead, deleteNotification } from "../services/notificationService";
import { SkeletonNotificationList } from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try { setNotifications(await getNotifications()); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const loadNotifications = async () => {
    try { setNotifications(await getNotifications()); }
    catch (err) { console.error(err); }
  };

  const handleRead = async (id: number) => {
    try { await markAsRead(id); await loadNotifications(); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleting(false); setConfirmDeleteId(null); }
  };

  const unread = notifications.filter((n) => !n.is_read).length;

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
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <SkeletonNotificationList />
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <Inbox size={28} className="text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">No notifications</h3>
          <p className="text-sm text-slate-600 max-w-xs">You're all caught up. New notifications will appear here.</p>
        </div>
      ) : (
        /* Notification list */
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`
                group flex items-start gap-4 rounded-xl border p-4 transition-all
                ${n.is_read
                  ? "border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40"
                  : "border-indigo-500/20 bg-indigo-500/[0.03]"
                }
                hover:border-slate-300 dark:hover:border-slate-700
              `}
            >
              {/* Indicator dot */}
              <div className="mt-1.5 shrink-0">
                {!n.is_read ? (
                  <span className="block h-2 w-2 rounded-full bg-indigo-500" />
                ) : (
                  <span className="block h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${n.is_read ? "text-slate-500 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                  {n.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => handleRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                    title="Mark as read"
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
                <button
                  onClick={() => setConfirmDeleteId(n.id)}
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
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}