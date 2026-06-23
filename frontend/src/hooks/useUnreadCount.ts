import { useEffect, useState, useCallback } from "react";
import { getUnreadCount } from "../services/notificationService";

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setCount(0);
      return;
    }
    try {
      setCount(await getUnreadCount());
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    void fetchCount();

    const intervalMs = 15000;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchCount();
      }
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchCount]);

  return count;
}
