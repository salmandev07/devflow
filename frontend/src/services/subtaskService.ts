import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/subtasks/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

type SubtaskData = { id: number; title: string; completed: boolean };

export const getSubtasks = async (taskId: number): Promise<SubtaskData[]> => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/subtasks/`,
    getAuthHeader()
  );

  return normalizeList<SubtaskData>(response.data);
};

export const getAllSubtasks = async (): Promise<SubtaskData[]> => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return normalizeList<SubtaskData>(response.data);
};

export const createSubtask = async (
  taskId: number,
  title: string
) => {
  const response = await axios.post(
    `${API_URL}tasks/${taskId}/subtasks/`,
    {
      title,
    },
    getAuthHeader()
  );

  return response.data;
};

interface UpdateSubtaskData {
  title?: string;
  completed?: boolean;
}

export const updateSubtask = async (
  id: number,
  data: UpdateSubtaskData
) => {
  const response = await axios.patch(
    `${API_URL}${id}/`,
    data,
    getAuthHeader()
  );

  return response.data;
};

export const deleteSubtask = async (
  id: number
) => {
  await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );
};