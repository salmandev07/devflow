import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/teams/";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getTeams = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );

  return response.data;
};

export const createTeam = async (
  teamData: { name: string }
) => {
  const response = await axios.post(
    API_URL,
    teamData,
    getAuthHeader()
  );

  return response.data;
};