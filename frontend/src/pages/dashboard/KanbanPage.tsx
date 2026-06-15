import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTasks } from "../../services/taskService";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTasks();
  }, []);

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  );

  const progressTasks = tasks.filter(
    (task) => task.status === "progress"
  );

  const doneTasks = tasks.filter(
    (task) => task.status === "done"
  );

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white mb-8">
        Kanban Board
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO */}
        <div className="bg-slate-900 rounded-2xl p-4 min-h-[500px]">
          <h2 className="text-lg font-bold text-white mb-4">
            Todo
          </h2>

          <div className="space-y-3">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800 rounded-xl p-4"
              >
                <h3 className="font-semibold text-white">
                  {task.title}
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  {task.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="bg-slate-900 rounded-2xl p-4 min-h-[500px]">
          <h2 className="text-lg font-bold text-white mb-4">
            In Progress
          </h2>

          <div className="space-y-3">
            {progressTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800 rounded-xl p-4"
              >
                <h3 className="font-semibold text-white">
                  {task.title}
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  {task.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DONE */}
        <div className="bg-slate-900 rounded-2xl p-4 min-h-[500px]">
          <h2 className="text-lg font-bold text-white mb-4">
            Done
          </h2>

          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800 rounded-xl p-4"
              >
                <h3 className="font-semibold text-white">
                  {task.title}
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  {task.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default KanbanPage;