import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getProject } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { getTeams } from "../../services/teamService";

type Project = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

type Task = {
  id: number;
  title: string;
  status: string;
  priority: string;
  project: number;
};

type Team = {
  id: number;
  name: string;
};

function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getProject(
          Number(id)
        );

        setProject(data);
      } catch (error) {
        console.error(error);
      }
    const allTasks = await getTasks();

    const projectTasks = allTasks.filter(
    (task: Task) =>
        task.project === Number(id)
    );

    setTasks(projectTasks);

    const allTeams = await getTeams();

    setTeams(allTeams);
    
    };

    

    void loadProject();
  }, [id]);

  if (!project) {
    return (
      <DashboardLayout>
        <p className="text-black">
          Loading...
        </p>
      </DashboardLayout>
    );
  }



  const totalTasks = tasks.length;

const todoTasks = tasks.filter(
  (task) => task.status === "todo"
).length;

const inProgressTasks = tasks.filter(
  (task) =>
    task.status === "in_progress"
).length;

const doneTasks = tasks.filter(
  (task) => task.status === "done"
).length;


  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-black">
        {project.name}
      </h1>

      <p className="mt-4 text-slate-400">
        {project.description}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-slate-400">
            Total Tasks
            </p>

            <p className="text-2xl font-bold text-white">
            {totalTasks}
            </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-slate-400">
            Todo
            </p>

            <p className="text-2xl font-bold text-white">
            {todoTasks}
            </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-slate-400">
            In Progress
            </p>

            <p className="text-2xl font-bold text-white">
            {inProgressTasks}
            </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-slate-400">
            Done
            </p>

            <p className="text-2xl font-bold text-white">
            {doneTasks}
            </p>
        </div>
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-black mb-4">
                Project Tasks
            </h2>

            {tasks.length === 0 ? (
                <p className="text-slate-400">
                No tasks found.
                </p>
            ) : (
                <div className="grid gap-4">
                {tasks.map((task) => (
                    <div
                    key={task.id}
                    className="
                        rounded-xl
                        bg-slate-800
                        p-4
                    "
                    >
                    <p className="font-semibold text-white">
                        {task.title}
                    </p>

                    <p className="text-slate-400">
                        Status: {task.status}
                    </p>

                    <p className="text-slate-400">
                        Priority: {task.priority}
                    </p>
                    </div>
                ))}
                </div>
            )}
            </div>

    <div className="mt-10">
        <h2 className="text-2xl font-bold text-black mb-4">
            Teams
        </h2>

        {teams.length === 0 ? (
            <p className="text-slate-400">
            No teams found.
            </p>
        ) : (
            <div className="grid gap-4">
            {teams.map((team) => (
                <div
                key={team.id}
                className="
                    rounded-xl
                    bg-slate-800
                    p-4
                "
                >
                <p className="font-semibold text-white">
                    {team.name}
                </p>
                </div>
            ))}
            </div>
        )}
        </div>
    </div>
    </DashboardLayout>
  );
}

export default ProjectDetailsPage;