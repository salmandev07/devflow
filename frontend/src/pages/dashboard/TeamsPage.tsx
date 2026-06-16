import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {getTeams,createTeam,} from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { updateTeam } from "../../services/teamService";

type Team = {
  id: number;
  name: string;
  owner: number;
  members: number[];
};

type User = {
  id: number;
  username: string;
};

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const teamData = await getTeams();
      const userData = await getUsers();

      setTeams(teamData);
      setUsers(userData);
    } catch (error) {
      console.error(error);
    }
  };

  void fetchData();
}, []);



const handleRemoveMember = async (
  teamId: number,
  userId: number
) => {
  try {
    const team = teams.find(
      (t) => t.id === teamId
    );

    if (!team) return;

    await updateTeam(teamId, {
      members: team.members.filter(
        (id) => id !== userId
      ),
    });

    const data = await getTeams();
    setTeams(data);
  } catch (error) {
    console.error(error);
  }
};


const handleAddMember = async (
  teamId: number,
  userId: number
) => {
  try {
    const team = teams.find(
      (t) => t.id === teamId
    );

    if (!team) return;

    if (team.members.includes(userId))
      return;

    await updateTeam(teamId, {
      members: [
        ...team.members,
        userId,
      ],
    });

    const data = await getTeams();
    setTeams(data);
  } catch (error) {
    console.error(error);
  }
};

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

            <p className="text-blue-400 mt-2">
              Members: {team.members.length}
            </p>
            <div className="mt-3">
              <p className="text-white text-sm font-semibold">
                Members
              </p>

             <div className="mt-2 flex flex-wrap gap-2">
                  {team.members.map((memberId) => {
                    const member = users.find(
                      (u) => u.id === memberId
                    );

                    return (
                      <div
                        key={memberId}
                        className="
                          flex
                          items-center
                          gap-2
                          bg-slate-800
                          px-2
                          py-1
                          rounded-full
                        "
                      >
                        <span className="text-xs text-white">
                          {member?.username}
                        </span>

                        <button
                          onClick={() =>
                            handleRemoveMember(
                              team.id,
                              memberId
                            )
                          }
                          className="
                            text-red-400
                            hover:text-red-300
                            text-xs
                          "
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
            </div>

            <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMember(
                      team.id,
                      Number(e.target.value)
                    );
                  }
                }}
                className="
                  mt-4
                  w-full
                  p-2
                  rounded-lg
                  bg-slate-800
                  text-white
                "
              >
                <option value="">
                  Add Member
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.username}
                  </option>
                ))}
              </select>

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