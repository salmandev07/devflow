import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getTasks = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
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
    actual_hours: number;
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

export const getTaskSessions =
  async (
    taskId: number
  ) => {
    const response =
      await axios.get(
        `${API_URL}${taskId}/sessions/`,
        getAuthHeader()
      );

    return response.data;
  };