import axios from "axios";

import { API_BASE_URL } from "../config/api";
import { normalizeList } from "../utils/pagination";

const API_URL = `${API_BASE_URL}/notifications/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

type NotificationData = { id: number; message: string; is_read: boolean };

export const getNotifications =
  async (): Promise<NotificationData[]> => {
    const response =
      await axios.get(
        API_URL,
        getAuthHeader()
      );

    return normalizeList<NotificationData>(response.data);
  };

export const markAsRead =
  async (id: number) => {
    const response =
      await axios.patch(
        `${API_URL}${id}/`,
        {
          is_read: true,
        },
        getAuthHeader()
      );

    return response.data;
  };

export const deleteNotification =
  async (id: number) => {
    await axios.delete(
      `${API_URL}${id}/`,
      getAuthHeader()
    );
  };