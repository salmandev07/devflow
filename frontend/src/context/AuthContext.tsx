/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { API_BASE_URL } from "../config/api";

export type UserProfile = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  avatar: string | null;
  full_name: string;
  position: string;
};

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

function isAuthenticated(): boolean {
  return !!localStorage.getItem("accessToken");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile/`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      if (!mountedRef.current) return;
      setProfile(data);
      localStorage.setItem("full_name", data.full_name || data.username);
      localStorage.setItem("position", data.position || "");
      if (data.avatar) localStorage.setItem("avatar", data.avatar);
      else localStorage.removeItem("avatar");
    } catch {
      if (mountedRef.current) setProfile(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!isAuthenticated()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        if (!mountedRef.current) return;
        setProfile(data);
        localStorage.setItem("full_name", data.full_name || data.username);
        localStorage.setItem("position", data.position || "");
        if (data.avatar) localStorage.setItem("avatar", data.avatar);
        else localStorage.removeItem("avatar");
      } catch {
        if (mountedRef.current) setProfile(null);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => { mountedRef.current = false; };
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("full_name", updated.full_name || updated.username);
      localStorage.setItem("position", updated.position || "");
      if (updated.avatar) localStorage.setItem("avatar", updated.avatar);
      else localStorage.removeItem("avatar");
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
