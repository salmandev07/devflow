import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth";

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