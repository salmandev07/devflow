import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {getTasks,createTask,updateTask,deleteTask,} from "../../services/taskService";
import { getUsers } from "../../services/userService";
import { getProjects } from "../../services/projectService";
import { getTeams } from "../../services/teamService";


type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;

  project: number;
  project_name?: string;

  team: number;
  team_name?: string;

  assigned_to: number | null;
  assigned_username?: string;

  due_date: string | null;
};

type User = {
  id: number;
  username: string;
};

  type Project = {
  id: number;
  name: string;
};

type Team = {
  id: number;
  name: string;
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

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

  const loadTeams = async () => {
  try {
    const data = await getTeams();
    setTeams(data);
  } catch (error) {
    console.error(error);
  }
};

  void loadProjects();
  void loadTeams();
  void fetchData();
}, []);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }


    if (!selectedProject) {
      alert("Please select a project");
      return;
    }

    if (!selectedTeam) {
      alert("Please select a team");
      return;
    }
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title,
          description,
          priority,
          due_date: dueDate || null,
          assigned_to: assignedTo,
        });
      } else {
        await createTask({
          title,
          description,
          priority,
          due_date: dueDate || null,
          project: Number(selectedProject),
          team: Number(selectedTeam),
          assigned_to: assignedTo,
        });
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo(null);
      setDueDate("");
      setEditingTask(null);
      setSelectedProject("");
      setSelectedTeam("");

      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
      alert("Failed to save task");
    }
  };



  const handleDeleteTask = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Delete this task?"
    );

    if (!confirmed) return;

    try {
      await deleteTask(id);

      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditTask = (task: Task) => {
  setEditingTask(task);

  setTitle(task.title);
  setDescription(task.description);
  setPriority(task.priority);
  setAssignedTo(task.assigned_to);
  setDueDate(task.due_date ?? "");
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
  value={selectedProject}
  onChange={(e) =>
    setSelectedProject(e.target.value)
  }
  className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
>
  <option value="">
    Select Project
  </option>

  {projects.map((project) => (
    <option
      key={project.id}
      value={project.id}
    >
      {project.name}
    </option>
  ))}
</select>

<select
  value={selectedTeam}
  onChange={(e) =>
    setSelectedTeam(e.target.value)
  }
  className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
>
  <option value="">
    Select Team
  </option>

  {teams.map((team) => (
    <option
      key={team.id}
      value={team.id}
    >
      {team.name}
    </option>
  ))}
</select>

      
        <input
        type="date"
        value={dueDate}
        onChange={(e) =>
          setDueDate(e.target.value)
        }
        className="
          w-full
          p-3
          rounded-xl
          bg-slate-800
          text-white
          border
          border-slate-700
          mb-4
        "
      />

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

        <button  onClick={handleCreateTask}  className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:scale-105 hover:bg-blue-700"  >
         {editingTask
          ? "Update Task"
          : "Create Task"}
        </button>
      </div>
      <br></br>
     
     

   <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="  mb-6  w-full  rounded-xl  border  border-slate-700  bg-slate-800 -3  text-white"/>

   #PROJECT FILTER  


    <select
      value={filterProject}
      onChange={(e) =>
        setFilterProject(e.target.value)
      }
      className="
        mb-6
        w-full
        rounded-xl
        border
        border-slate-700
        bg-slate-800
        p-3
        text-white
      "
    >
      <option value="">
        All Projects
      </option>

      {projects.map((project) => (
        <option
          key={project.id}
          value={project.id}
        >
          {project.name}
        </option>
      ))}
    </select>

#TEAM FILTER

    <select
      value={filterTeam}
      onChange={(e) =>
        setFilterTeam(e.target.value)
      }
      className="
        mb-6
        w-full
        rounded-xl
        border
        border-slate-700
        bg-slate-800
        p-3
        text-white
      "
    >
      <option value="">
        All Teams
      </option>

      {teams.map((team) => (
        <option
          key={team.id}
          value={team.id}
        >
          {team.name}
        </option>
      ))}
    </select>

    # STATUS FILTER

    <select
  value={filterStatus}
  onChange={(e) =>
    setFilterStatus(e.target.value)
  }
  className="
    mb-6
    w-full
    rounded-xl
    border
    border-slate-700
    bg-slate-800
    p-3
    text-white
  "
>
  <option value="">
    All Statuses
  </option>

  <option value="todo">
    Todo
  </option>

  <option value="in_progress">
    In Progress
  </option>

  <option value="done">
    Done
  </option>
</select>

# PRIORITY FILTER 

<select
  value={filterPriority}
  onChange={(e) =>
    setFilterPriority(e.target.value)
  }
  className="
    mb-6
    w-full
    rounded-xl
    border
    border-slate-700
    bg-slate-800
    p-3
    text-white
  "
>
  <option value="">
    All Priorities
  </option>

  <option value="low">
    Low
  </option>

  <option value="medium">
    Medium
  </option>

  <option value="high">
    High
  </option>
</select>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      
      {tasks
        .filter((task) => {
          const search =
            searchTerm.toLowerCase();

          const matchesSearch =
            task.title
              .toLowerCase()
              .includes(search) ||
            task.description
              .toLowerCase()
              .includes(search);

          const matchesProject =
            !filterProject ||
            task.project ===
              Number(filterProject);
          
          const matchesTeam =
            !filterTeam ||
            task.team === Number(filterTeam);

          const matchesStatus =
            !filterStatus ||
            task.status === filterStatus;

          const matchesPriority =
            !filterPriority ||
            task.priority === filterPriority;

    return (
      matchesSearch &&
      matchesProject &&
      matchesTeam &&
      matchesStatus &&
      matchesPriority
    );
  })
  .map((task) => (
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

            <p className="mt-2 text-sm text-purple-400">
              Project: {task.project_name}
            </p>

            <p className="mt-1 text-sm text-cyan-400">
              Team: {task.team_name}
            </p>

            {task.assigned_username && (
              <p className="mt-2 text-sm text-blue-400">
                Assigned to:{" "}
                {task.assigned_username}
              </p>
            )}

            {task.due_date && (
              <p className="mt-2 text-sm text-orange-400">
                📅 Due: {task.due_date}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
                {task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.status !== "done" && (
                    <span
                      className="
                        rounded-full
                        bg-red-700
                        px-2
                        py-1
                        text-xs
                        text-white
                      "
                    >
                      OVERDUE
                    </span>
                )}
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

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/tasks/${task.id}`)
                  }
                  className="
                    rounded-lg
                    bg-blue-600
                    px-3
                    py-1
                    text-white
                    hover:bg-blue-700
                  "
                >
                  Open
                </button>

                <button
                  onClick={() => handleEditTask(task)}
                  className="
                    rounded-lg
                    bg-yellow-600
                    px-3
                    py-1
                    text-white
                    hover:bg-yellow-700
                  "
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDeleteTask(task.id)
                  }
                  className="
                    rounded-lg
                    bg-red-600
                    px-3
                    py-1
                    text-white
                    hover:bg-red-700
                  "
                >
                  Delete
                </button>
              </div>


            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default TasksPage;