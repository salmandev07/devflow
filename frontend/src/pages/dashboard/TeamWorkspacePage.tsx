import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTeam } from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { getTasks } from "../../services/taskService";
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, } from "../../services/teamMembershipService";


type Team = {
  id: number;
  name: string;
  owner: number;
  members: number[];
  created_at: string;
};

type User = {
  id: number;
  username: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  team: number;
  team_name?: string;
};

type TeamMembership = {
  id: number;
  user: number;
  username: string;
  role: string;
};

function TeamWorkspacePage() {

  
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("developer");

  useEffect(() => {
      const loadTeam = async () => {
        try {
          const data = await getTeam(
            Number(id)
          );

          const userData =
            await getUsers();
          
          const taskData =
            await getTasks();

          const membershipData =
            await getTeamMembers(
              Number(id)
            );


          setTeam(data);
          setUsers(userData);
          setTasks(taskData);
          setMemberships(membershipData);
          
        } catch (error) {
          console.error(error);
        }
      };
      
    void loadTeam();
  }, [id]);


  const teamTasks = team
    ? tasks.filter(
        (task) => task.team === team.id
      )
    : [];

  const todoTasks = teamTasks.filter(
    (task) => task.status === "todo"
  );

  const inProgressTasks =
    teamTasks.filter(
      (task) =>
        task.status === "in_progress"
    );

  const doneTasks = teamTasks.filter(
    (task) => task.status === "done"
  );

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      await addTeamMember(
        Number(id),
        Number(selectedUser),
        selectedRole
      );

      const updatedMembers =
        await getTeamMembers(
          Number(id)
        );

      setMemberships(
        updatedMembers
      );

      setSelectedUser("");
      setSelectedRole(
        "developer"
      );
    } catch (error) {
      console.error(error);
    }
  };
 
  const reloadMembers = async () => {
  const data = await getTeamMembers(
    Number(id)
  );

  setMemberships(data);
};

const handleRoleChange = async (
  membershipId: number,
  role: string
) => {
  try {
    await updateTeamMember(
      membershipId,
      role
    );

    await reloadMembers();
  } catch (error) {
    console.error(error);
  }
};

const handleRemoveMember = async (
  membershipId: number
) => {
  try {
    await deleteTeamMember(
      membershipId
    );

    await reloadMembers();
  } catch (error) {
    console.error(error);
  }
};

  if (!team) {
    return (
      <DashboardLayout>
        <p className="text-white">
          Loading...
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white">
          {team.name}
        </h1>

        <p className="mt-3 text-slate-400">
          Team ID: {team.id}
        </p>

        <p className="mt-2 text-slate-400">
          Owner: {
            users.find(
              (user) => user.id === team.owner
            )?.username || `User #${team.owner}`
          }
        </p>
        <p className="mt-2 text-slate-400">
          Members: {team.members.length}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <h3 className="text-slate-400">
              Total Tasks
            </h3>

            <p className="text-2xl font-bold text-white">
              {teamTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <h3 className="text-slate-400">
              Todo
            </h3>

            <p className="text-2xl font-bold text-white">
              {todoTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <h3 className="text-slate-400">
              In Progress
            </h3>

            <p className="text-2xl font-bold text-white">
              {inProgressTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <h3 className="text-slate-400">
              Done
            </h3>

            <p className="text-2xl font-bold text-white">
              {doneTasks.length}
            </p>
          </div>
        </div>


       
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-black">
              Team Members
            </h2>

            <div className="mt-3 space-y-2">
              {memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      bg-slate-800
                      p-3
                      text-white
                    "
                  >
                    <span>
                      {membership.username}
                    </span>

                    <div className="flex gap-2">

                      <select
                        value={membership.role}
                        onChange={(e) =>
                          handleRoleChange(
                            membership.id,
                            e.target.value
                          )
                        }
                        className="
                          rounded-lg
                          bg-slate-700
                          px-2
                          py-1
                        "
                      >
                        <option value="lead">
                          Lead
                        </option>

                        <option value="developer">
                          Developer
                        </option>

                        <option value="tester">
                          Tester
                        </option>

                        <option value="designer">
                          Designer
                        </option>
                      </select>

                      <button
                        onClick={() =>
                          handleRemoveMember(
                            membership.id
                          )
                        }
                        className="
                          rounded-lg
                          bg-red-600
                          px-3
                          py-1
                        "
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                ))}
            </div>
          </div>


          <div className="mt-4 flex gap-3 flex-wrap">

            <select
              value={selectedUser}
              onChange={(e) =>
                setSelectedUser(
                  e.target.value
                )
              }
              className="
                rounded-lg
                bg-slate-700
                px-3
                py-2
                text-white
              "
            >
              <option value="">
                Select User
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

            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(
                  e.target.value
                )
              }
              className="
                rounded-lg
                bg-slate-700
                px-3
                py-2
                text-white
              "
            >
              <option value="lead">
                Lead
              </option>

              <option value="developer">
                Developer
              </option>

              <option value="tester">
                Tester
              </option>

              <option value="designer">
                Designer
              </option>
            </select>

            <button
              onClick={
                handleAddMember
              }
              className="
                rounded-lg
                bg-blue-600
                px-4
                py-2
                text-white
              "
            >
              Add Member
            </button>

          </div>
                  


        <div className="mt-8">
          <h2 className="text-xl font-semibold text-black">
            Team Tasks
          </h2>

          <div className="mt-4 space-y-3">
            {tasks
              .filter(
                (task) =>
                  task.team === team.id
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg bg-slate-800 p-4"
                >
                  <h3 className="font-semibold text-white">
                    {task.title}
                  </h3>

                  <p className="text-slate-400">
                    {task.description}
                  </p>

                  <p className="mt-2 text-sm text-blue-400">
                    Status: {task.status}
                  </p>

                  <p className="text-sm text-yellow-400">
                    Priority: {task.priority}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TeamWorkspacePage;
