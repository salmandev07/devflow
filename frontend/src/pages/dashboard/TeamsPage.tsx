import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getTeams,
  createTeam,
} from "../../services/teamService";

type Team = {
  id: number;
  name: string;
};

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const fetchTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchTeams();
}, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Team name is required");
      return;
    }

    try {
      await createTeam({
        name: teamName,
      });

      setTeamName("");
      loadTeams();
    } catch (error) {
      console.error(error);
      alert("Failed to create team");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white">
        Teams
      </h1>

      <div className="bg-slate-900 p-6 rounded-2xl mt-8 shadow-xl">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) =>
            setTeamName(e.target.value)
          }
          className="
            w-full
            p-3
            rounded-xl
            bg-slate-800
            text-white
            border
            border-slate-700
            outline-none
            focus:border-blue-500
          "
        />

        <button
          onClick={handleCreateTeam}
          className="
            mt-4
            bg-blue-600
            hover:bg-blue-700
            px-6
            py-3
            rounded-xl
            text-white
            transition-all
            duration-300
            hover:scale-105
          "
        >
          Create Team
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {teams.map((team) => (
          <div
            key={team.id}
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-6
              shadow-xl
              transition-all
              duration-300
              hover:scale-105
              hover:border-blue-500
            "
          >
            <h2 className="text-xl font-bold text-white">
              {team.name}
            </h2>

            <p className="text-slate-400 mt-3">
              Team Workspace
            </p>

            <div className="mt-5 flex gap-3">
              <button
                className="
                  px-4 py-2
                  bg-blue-600
                  hover:bg-blue-700
                  rounded-lg
                  text-white
                "
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default TeamsPage;