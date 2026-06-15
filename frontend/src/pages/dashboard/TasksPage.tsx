import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getTasks,
  createTask,
} from "../../services/taskService";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  

    useEffect(() => {
    const fetchTasks = async () => {
        try {
        const data = await getTasks();
        setTasks(data);
        } catch (error) {
        console.error(error);
        }
    };

    void fetchTasks();
    }, []);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      await createTask({
        title,
        description,
        priority,
        project: 1,
        team: 1,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");

      const data = await getTasks();
        setTasks(data);
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white">
        Tasks
      </h1>

      <div className="bg-slate-900 p-6 rounded-2xl mt-8 shadow-xl">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-3"
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4"
        >
          <option value="low">Low Priority</option>
          <option value="medium">
            Medium Priority
          </option>
          <option value="high">
            High Priority
          </option>
        </select>

        <button
          onClick={handleCreateTask}
          className="
            bg-blue-600
            hover:bg-blue-700
            px-6
            py-3
            rounded-xl
            text-white
            transition-all
            hover:scale-105
          "
        >
          Create Task
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-6
              shadow-xl
              hover:border-blue-500
              transition-all
            "
          >
            <h2 className="text-xl font-bold text-white">
              {task.title}
            </h2>

            <p className="text-slate-400 mt-3">
              {task.description}
            </p>

            <div className="flex gap-2 mt-4">
              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-blue-600
                  text-white
                  text-sm
                "
              >
                {task.status}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm text-white ${
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
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default TasksPage;