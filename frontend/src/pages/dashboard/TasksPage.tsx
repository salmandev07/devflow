import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTasks, createTask } from "../../services/taskService";
import { getUsers } from "../../services/userService";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: number | null;
  assigned_to_username?: string;
};

type User = {
  id: number;
  username: string;
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] =
    useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await getTasks();
        const userData = await getUsers();

        setTasks(taskData);
        setUsers(userData);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchData();
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
        assigned_to: assignedTo,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo(null);

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

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 shadow-xl">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
        >
          <option value="low">
            Low Priority
          </option>
          <option value="medium">
            Medium Priority
          </option>
          <option value="high">
            High Priority
          </option>
        </select>

        <select
          value={assignedTo ?? ""}
          onChange={(e) =>
            setAssignedTo(
              e.target.value
                ? Number(e.target.value)
                : null
            )
          }
          className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
        >
          <option value="">
            Unassigned
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

        <button
          onClick={handleCreateTask}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:scale-105 hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition-all hover:border-blue-500"
          >
            <h2 className="text-xl font-bold text-white">
              {task.title}
            </h2>

            <p className="mt-3 text-slate-400">
              {task.description}
            </p>

            {task.assigned_to_username && (
              <p className="mt-2 text-sm text-blue-400">
                Assigned to:{" "}
                {task.assigned_to_username}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
                {task.status}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-sm text-white ${
                  task.priority === "high"
                    ? "bg-red-600"
                    : task.priority ===
                      "medium"
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