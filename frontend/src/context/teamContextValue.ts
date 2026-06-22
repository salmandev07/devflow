import { createContext } from "react";

export type Team = { id: number; name: string; owner: number; members: number[] };

export interface TeamContextType {
  teams: Team[];
  loading: boolean;
  error: string | null;
  refreshTeams: () => Promise<void>;
  teamCount: number;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
