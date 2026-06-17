import { useEffect, useState } from "react";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
};

function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const loadNotifications =
    async () => {
      try {
        const data =
          await getNotifications();

        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };

useEffect(() => {
  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  void loadNotifications();
}, []);

  const handleRead =
    async (id: number) => {
      try {
        await markAsRead(id);

        await loadNotifications();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (id: number) => {
      try {
        await deleteNotification(id);

        await loadNotifications();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-white mb-4">
        🔔 Notifications
      </h2>

      <div className="space-y-4">
        {notifications.map(
          (notification) => (
            <div
              key={notification.id}
              className="
                bg-slate-900
                rounded-xl
                p-4
              "
            >
              <p className="text-white">
                {notification.message}
              </p>

              <p className="text-sm text-slate-400 mt-2">
                {notification.is_read
                  ? "Read"
                  : "Unread"}
              </p>

              <div className="mt-3 flex gap-3">
                {!notification.is_read && (
                  <button
                    onClick={() =>
                      handleRead(
                        notification.id
                      )
                    }
                    className="
                      bg-green-600
                      px-3
                      py-1
                      rounded-lg
                      text-white
                    "
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() =>
                    handleDelete(
                      notification.id
                    )
                  }
                  className="
                    bg-red-600
                    px-3
                    py-1
                    rounded-lg
                    text-white
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;