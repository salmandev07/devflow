import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/users/list/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export type UserData = {
  id: number;
  username: string;
  avatar: string | null;
  full_name: string;
  position: string;
};

export const getUsers = async (): Promise<UserData[]> => {
  const response = await axios.get(API_URL, getAuthHeader());
  return normalizeList<UserData>(response.data);
};

export const getAvailableUsers = async (excludeTeamId?: number): Promise<UserData[]> => {
  const params: Record<string, string> = {};
  if (excludeTeamId) {
    params.exclude_team = String(excludeTeamId);
  }
  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params,
  });
  return normalizeList<UserData>(response.data);
};
