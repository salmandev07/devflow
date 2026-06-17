import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/subtasks/";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getSubtasks = async (taskId: number) => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/subtasks/`,
    getAuthHeader()
  );

  return response.data;
};

export const getAllSubtasks = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
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