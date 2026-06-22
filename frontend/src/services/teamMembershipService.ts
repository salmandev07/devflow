import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/teams/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getTeamMembers = async (
  teamId: number
) => {
  const response = await axios.get(
    `${API_URL}${teamId}/members/`,
    getAuthHeader()
  );

  return response.data;
};

export const addTeamMember = async (
  teamId: number,
  user: number,
  role: string
) => {
  const response = await axios.post(
    `${API_URL}${teamId}/members/`,
    {
      team: teamId,
      user,
      role,
    },
    getAuthHeader()
  );

  return response.data;
};

export const updateTeamMember = async (
  id: number,
  role: string
) => {
  const response = await axios.patch(
    `${API_URL}memberships/${id}/`,
    { role },
    getAuthHeader()
  );

  return response.data;
};

export const deleteTeamMember = async (
  id: number
) => {
  await axios.delete(
    `${API_URL}memberships/${id}/`,
    getAuthHeader()
  );
};