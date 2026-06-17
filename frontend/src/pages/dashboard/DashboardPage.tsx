import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import TaskStatusChart from "../../components/TaskStatusChart";
import { getProjects } from "../../services/projectService";
import { getTeams } from "../../services/teamService";
import { getTasks } from "../../services/taskService";
import TaskPriorityChart from "../../components/TaskPriorityChart";
import ActivityFeed from "../../components/ActivityFeed";

type Task = {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigned_to_username?: string;
  due_date?: string | null;
};

function DashboardPage() {
  const [projectCount, setProjectCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);

  const totalProjects = projectCount;
  const totalTeams = teamCount;
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "progress"
  ).length;

  const lowPriorityTasks = tasks.filter(
    (task) => task.priority === "low"
  ).length;

  const mediumPriorityTasks = tasks.filter(
    (task) => task.priority === "medium"
  ).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high"
).length;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const projects = await getProjects();
        const teams = await getTeams();
        const taskData = await getTasks();

        setProjectCount(projects.length);
        setTeamCount(teams.length);
        setTasks(taskData);
      } catch (error) {
        console.error(error);
      }
    };

    void loadDashboard();
  }, []);

  const upcomingTasks = tasks
  .filter((task) => task.due_date)
  .sort(
    (a, b) =>
      new Date(a.due_date!).getTime() -
      new Date(b.due_date!).getTime()
  )
  .slice(0, 5);

  const overdueTasks = tasks.filter(
  (task) =>
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date()
);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-black">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Manage projects, teams and tasks.
        </p>
      </div>

      {/* Stats Cards */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Projects", totalProjects],
          ["Teams", totalTeams],
          ["Tasks", totalTasks],
          ["Completed", completedTasks],
          ["Todo", todoTasks],
          ["In Progress", progressTasks],
        ].map(([title, count]) => (
          <div
            key={String(title)}
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-6
              shadow-xl
              hover:scale-105
              transition-all
              duration-300
            "
          >
            <h3 className="text-slate-400">
              {title}
            </h3>

            <p className="mt-3 text-4xl font-bold text-white">
              {count}
            </p>
          </div>
        ))}
      </div>


      <h2 className="text-2xl font-bold text-black mt-10">
        Upcoming Deadlines
      </h2>

      <div className="mt-4 space-y-3">
        {upcomingTasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900 p-4 rounded-xl"
          >
            <p className="text-white font-semibold">
              {task.title}
            </p>

            <p className="text-orange-400 text-sm">
              📅 {task.due_date}
            </p>
          </div>
        ))}
      </div>

{overdueTasks.length > 0 && (
  
  <div className="mt-10">
    <h2 className="mb-4 text-2xl font-bold text-red-400">
      ⚠ Overdue Tasks
    </h2>

    <div className="space-y-3">
      {overdueTasks.map((task) => (
        <div
          key={task.id}
          className="
            rounded-xl
            border
            border-red-700
            bg-red-950
            p-4
          "
        >
          <p className="font-semibold text-white">
            {task.title}
          </p>

          <p className="text-red-300 text-sm">
            Due: {task.due_date}
          </p>
        </div>
      ))}
      
    </div>
  </div>
)}

    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <TaskStatusChart
        todo={todoTasks}
        inProgress={progressTasks}
        done={completedTasks}
      />

      <TaskPriorityChart
        low={lowPriorityTasks}
        medium={mediumPriorityTasks}
        high={highPriorityTasks}
      />
    </div>

    <div className="mt-10">
      <ActivityFeed />
    </div>


      {/* Recent Tasks */}

      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold text-black">
          Recent Tasks
        </h2>

        <div className="grid gap-4">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                p-4
              "
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  {task.title}
                </h3>

                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    task.priority === "high"
                      ? "bg-red-600"
                      : task.priority === "medium"
                      ? "bg-yellow-600"
                      : "bg-green-600"
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>
                  Status: {task.status}
                </span>

                <span>
                  Assigned:{" "}
                  {task.assigned_to_username ??
                    "Unassigned"}
                </span>

                {task.due_date && (
                  <span>
                    Due: {task.due_date}
                  </span>
                )}
              </div>
              
              
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;