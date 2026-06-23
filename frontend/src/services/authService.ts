import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/auth`;

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post(
    `${API_URL}/register/`,
    userData
  );
  return response.data;
};

export const loginUser = async (userData: {
  username: string;
  password: string;
}) => {
  const response = await axios.post(
    `${API_URL}/login/`,
    userData
  );
  return response.data;
};

export const verifyEmail = async (username: string, otp: string) => {
  const response = await axios.post(
    `${API_URL}/verify-email/`,
    { username, otp }
  );
  return response.data;
};

export const resendVerification = async (username: string) => {
  const response = await axios.post(
    `${API_URL}/resend-verification/`,
    { username }
  );
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axios.post(
    `${API_URL}/forgot-password/`,
    { email }
  );
  return response.data;
};

export const verifyResetOTP = async (email: string, otp: string) => {
  const response = await axios.post(
    `${API_URL}/verify-reset-otp/`,
    { email, otp }
  );
  return response.data;
};

export const resetPasswordWithOTP = async (uid: string, password: string) => {
  const response = await axios.post(
    `${API_URL}/reset-password/`,
    { uid, password }
  );
  return response.data;
};
