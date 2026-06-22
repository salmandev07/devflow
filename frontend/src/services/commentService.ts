import axios from "axios";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/comments/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

export const getComments = async (
  taskId: number
) => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/comments/`,
    getAuthHeader()
  );

  return response.data;
};

export const createComment = async (
  taskId: number,
  content: string
) => {
  const response = await axios.post(
    `${API_URL}tasks/${taskId}/comments/`,
    {
      task: taskId,
      content,
    },
    getAuthHeader()
  );

  return response.data;
};

export const deleteComment = async (
  id: number
) => {
  await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );
};