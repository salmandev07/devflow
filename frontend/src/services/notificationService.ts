import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api/notifications/";

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