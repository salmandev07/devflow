import axios from "axios";
import { API_BASE_URL } from "../config/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/login/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          if (response.data.access) {
            localStorage.setItem("accessToken", response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/";
        }
      } else {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
