import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/activities/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

type ActivityData = { id: number; message: string; created_at: string };

export const getActivities = async (): Promise<ActivityData[]> => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return normalizeList<ActivityData>(response.data);
};