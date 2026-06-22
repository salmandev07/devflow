import axios from "axios";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/notifications/`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "accessToken"
    )}`,
  },
});

export const getNotifications =
  async () => {
    const response =
      await axios.get(
        API_URL,
        getAuthHeader()
      );

    return response.data;
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