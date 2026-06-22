import { useEffect, useState } from "react";
import { getActivities } from "../services/activityService";
import { Activity, Clock } from "lucide-react";

type ActivityItem = { id: number; message: string; created_at: string };

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

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivities();
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={15} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Clock size={28} className="text-slate-700 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-500">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-0 overflow-y-auto max-h-72">
          {activities.slice(0, 12).map((item, idx) => (
            <div key={item.id} className={`flex gap-3 py-3 ${idx < activities.slice(0,12).length - 1 ? "border-b border-slate-200/60 dark:border-slate-800/60" : ""}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Activity size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{item.message}</p>
                <p className="text-xs text-slate-600 mt-0.5">{timeAgo(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}