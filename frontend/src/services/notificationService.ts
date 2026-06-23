import axios from "axios";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/notifications/`;

function getAuthHeader() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  };
}

export type NotificationData = {
  id: number;
  actor: number | null;
  actor_username: string | null;
  notification_type: string;
  type_display: string;
  message: string;
  url: string;
  is_read: boolean;
  created_at: string;
};

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationData[];
};

export const getNotifications = async (params?: {
  is_read?: boolean;
  type?: string;
  page?: number;
}): Promise<PaginatedResponse> => {
  const query: Record<string, string> = {};
  if (params?.is_read !== undefined) query.is_read = String(params.is_read);
  if (params?.type) query.type = params.type;
  if (params?.page) query.page = String(params.page);

  const response = await axios.get(API_URL, {
    ...getAuthHeader(),
    params: { ...query, _: Date.now() },
  });

  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await axios.patch(
    `${API_URL}${id}/`,
    { is_read: true },
    getAuthHeader()
  );
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.post(
    `${API_URL}mark-all-read/`,
    {},
    getAuthHeader()
  );
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await axios.get(
    `${API_URL}unread-count/`,
    getAuthHeader()
  );
  return response.data.unread_count;
};

export const deleteNotification = async (id: number) => {
  await axios.delete(`${API_URL}${id}/`, getAuthHeader());
};
