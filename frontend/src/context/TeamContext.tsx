import { useEffect, useState, useCallback } from "react";
import { getTeams } from "../services/teamService";
import { TeamContext, type Team } from "./teamContextValue";

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTeams = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setTeams([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load teams";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    queueMicrotask(() => {
      refreshTeams();
    });
  }, [refreshTeams]);

  return (
    <TeamContext.Provider value={{ teams, loading, error, refreshTeams, teamCount: teams.length }}>
      {children}
    </TeamContext.Provider>
  );
}
