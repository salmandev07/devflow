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