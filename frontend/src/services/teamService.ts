import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/teams/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export type TeamData = { id: number; name: string; owner: number; project: number | null; project_name?: string; members: number[]; created_at: string };

export const getTeams = async (): Promise<TeamData[]> => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return normalizeList<TeamData>(response.data);
};

export const createTeam = async (
  teamData: { name: string }
) => {
  const response = await axios.post(
    API_URL,
    teamData,
    getAuthHeader()
  );

  return response.data;
};

export const updateTeam = async (
  id: number,
  data: Record<string, unknown>
) => {
  const response = await axios.patch(
    `${API_URL}${id}/`,
    data,
    getAuthHeader()
  );

  return response.data;
};

export const deleteTeam = async (
  id: number
) => {
  const response = await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};

export const getTeam = async (
  id: number
) => {
  const response = await axios.get(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};