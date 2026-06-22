import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/comments/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

type CommentData = { id: number; username: string; content: string; created_at: string };

export const getComments = async (
  taskId: number
): Promise<CommentData[]> => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/comments/`,
    getAuthHeader()
  );

  return normalizeList<CommentData>(response.data);
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