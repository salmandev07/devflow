import { useEffect, useState, useRef } from "react";
import { getUnreadCount } from "../services/notificationService";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const loadCount = async () => {
      if (!localStorage.getItem("accessToken")) {
        if (mountedRef.current) setCount(0);
        return;
      }
      try {
        const c = await getUnreadCount();
        if (mountedRef.current) setCount(c);
      } catch {
        // silently fail
      }
    };

    loadCount();

    const intervalMs = 15000;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadCount();
      }
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return count;
}
