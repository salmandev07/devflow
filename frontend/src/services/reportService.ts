import axios from "axios";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/projects/`;

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