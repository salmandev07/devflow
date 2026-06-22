import axios from "axios";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/projects/`;

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProjects = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

export const createProject = async (
  projectData: {
    name: string;
    description: string;
  }
) => {
  const response = await axios.post(
    API_URL,
    projectData,
    getAuthHeader()
  );

  return response.data;
};


export const getProject = async (
  id: number
) => {
  const response = await axios.get(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};

export const updateProject = async (
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

export const deleteProject = async (
  id: number
) => {
  const response = await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};

export const assignTeamToProject = async (
  projectId: number,
  teamId: number
) => {
  const response = await axios.post(
    `${API_URL}${projectId}/assign-team/`,
    { team_id: teamId },
    getAuthHeader()
  );
  return response.data;
};

export const unassignTeamFromProject = async (
  projectId: number,
  teamId: number
) => {
  const response = await axios.post(
    `${API_URL}${projectId}/unassign-team/`,
    { team_id: teamId },
    getAuthHeader()
  );
  return response.data;
};