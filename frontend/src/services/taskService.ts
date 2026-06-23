import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/tasks/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export type TaskData = {
  id: number; title: string; description: string; status: string; priority: string;
  project: number; project_name?: string; team: number; team_name?: string;
  assigned_to: number | null; assigned_to_username?: string; created_by: number | null;
  estimated_hours: number; due_date: string | null;
};

export const getTasks = async (): Promise<TaskData[]> => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return normalizeList<TaskData>(response.data);
};

export const createTask = async (
  taskData: {
    title: string;
    description: string;
    project: number;
    team: number;
    priority: string;
    due_date: string | null;
    assigned_to: number | null;
    estimated_hours: number;
  }
) => {
  const response = await axios.post(
    API_URL,
    taskData,
    getAuthHeader()
  );

  return response.data;
};

export const updateTask = async (
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

export const deleteTask = async (
  id: number
) => {
  const response = await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};

export const getTask = async (
  id: number
) => {
  const response = await axios.get(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};

export const startTimer = async (
  taskId: number
) => {
  const response = await axios.post(
    `${API_URL}${taskId}/start-timer/`,
    {},
    getAuthHeader()
  );

  return response.data;
};

export const stopTimer = async (
  taskId: number
) => {
  const response = await axios.post(
    `${API_URL}${taskId}/stop-timer/`,
    {},
    getAuthHeader()
  );

  return response.data;
};

export const getTimerStatus = async (
  taskId: number
) => {
  const response = await axios.get(
    `${API_URL}${taskId}/timer-status/`,
    getAuthHeader()
  );

  return response.data;
};

type TimeSessionData = { id: number; username: string; started_at: string; ended_at: string | null; duration_hours: string };

export const getTaskSessions =
  async (
    taskId: number
  ): Promise<TimeSessionData[]> => {
    const response =
      await axios.get(
        `${API_URL}${taskId}/sessions/`,
        getAuthHeader()
      );

    return normalizeList<TimeSessionData>(response.data);
  };