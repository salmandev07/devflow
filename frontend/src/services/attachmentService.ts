import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/attachments/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

type AttachmentData = { id: number; file: string; uploaded_by_username: string };

export const getAttachments = async (
  taskId: number
): Promise<AttachmentData[]> => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/attachments/`,
    getAuthHeader()
  );

  return normalizeList<AttachmentData>(response.data);
};

export const uploadAttachment = async (
  taskId: number,
  file: File
) => {
  const formData = new FormData();

  formData.append("task", String(taskId));
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}tasks/${taskId}/attachments/`,
    formData,
    {
      headers: {
        ...getAuthHeader().headers,
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteAttachment =
  async (id: number) => {
    await axios.delete(
      `${API_URL}${id}/`,
      getAuthHeader()
    );
  };