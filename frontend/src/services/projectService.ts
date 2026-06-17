import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/projects/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");

  console.log("TOKEN:", token);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProjects = async () => {
  console.log(getAuthHeader());

  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

export const createProject = async (
  projectData: {
    name: string;
    description: string;
  }
) => {
  console.log(getAuthHeader());

  const response = await axios.post(
    API_URL,
    projectData,
    getAuthHeader()
  );

  return response.data;
};


export const getProject = async (
  id: number
) => {
  const response = await axios.get(
    `${API_URL}${id}/`,
    getAuthHeader()
  );

  return response.data;
};