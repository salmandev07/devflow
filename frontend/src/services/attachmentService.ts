import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api/attachments/";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

export const getAttachments = async (
  taskId: number
) => {
  const response = await axios.get(
    `${API_URL}tasks/${taskId}/attachments/`,
    getAuthHeader()
  );

  return response.data;
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