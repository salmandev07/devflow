import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/users/list/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getUsers = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getAvailableUsers = async (excludeTeamId?: number) => {
  const params: Record<string, string> = {};
  if (excludeTeamId) {
    params.exclude_team = String(excludeTeamId);
  }
  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};
