import { useEffect, useState } from "react";
import { getActivities } from "../services/activityService";

type Activity = {
  id: number;
  message: string;
  created_at: string;
};

function ActivityFeed() {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await getActivities();
        setActivities(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadActivities();
  }, []);

  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-6
      shadow-xl
    "
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        Recent Activity
      </h2>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-slate-400">
            No activity yet.
          </p>
        ) : (
          activities.slice(0, 10).map((activity) => (
            <div
              key={activity.id}
              className="
                border-b
                border-slate-800
                pb-3
              "
            >
              <p className="text-white">
                {activity.message}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {new Date(
                  activity.created_at
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;