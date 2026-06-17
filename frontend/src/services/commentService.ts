import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api/comments/";

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