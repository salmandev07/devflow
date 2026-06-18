import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api/projects/";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

export const getProjectReport =
  async (
    projectId: number
  ) => {
    const response =
      await axios.get(
        `${API_URL}${projectId}/report/`,
        getAuthHeader()
      );

    return response.data;
  };