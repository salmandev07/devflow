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