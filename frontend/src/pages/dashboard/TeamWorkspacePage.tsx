import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTeam } from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { getTasks } from "../../services/taskService";

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


function TeamWorkspacePage() {

  
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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


          setTeam(data);
          setUsers(userData);
          setTasks(taskData);
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
          <h2 className="text-xl font-semibold text-white">
            Team Members
          </h2>

          <div className="mt-3 space-y-2">
            {team.members.map(
              (memberId) => {
                const user =
                  users.find(
                    (u) =>
                      u.id === memberId
                  );

                return (
                  <div
                    key={memberId}
                    className="rounded-lg bg-slate-800 p-3 text-white"
                  >
                    {user
                      ? user.username
                      : `User #${memberId}`}
                  </div>
                );
              }
            )}
          </div>
        </div>


        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white">
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
