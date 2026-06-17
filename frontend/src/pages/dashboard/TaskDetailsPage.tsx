import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTask } from "../../services/taskService";
import TaskComments from "../../components/TaskComments";
import TaskAttachments from "../../components/TaskAttachments";
import TaskSubtasks from "../../components/TaskSubtasks";


type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string | null;

  project_name?: string;
  team_name?: string;

  assigned_username?: string;
};

function TaskDetailsPage() {
  const { id } = useParams();

  const [task, setTask] =
    useState<Task | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const data = await getTask(
          Number(id)
        );

        setTask(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadTask();
  }, [id]);

  if (!task) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className="
        bg-slate-900
        rounded-2xl
        p-6
      "
      >
        <h1 className="text-3xl font-bold text-white">
          {task.title}
        </h1>

        <p className="text-slate-400 mt-4">
          {task.description}
        </p>

        <div className="mt-6 space-y-2">
          <p className="text-white">
            Status: {task.status}
          </p>

          <p className="text-white">
            Priority: {task.priority}
          </p>

          <p className="text-white">
            Assigned:
            {" "}
            {task.assigned_username ??
              "Unassigned"}
          </p>

          <p className="text-white">
            Project:
            {" "}
            {task.project_name}
          </p>

          <p className="text-white">
            Team:
            {" "}
            {task.team_name ??
              "None"}
          </p>

          <p className="text-white">
            Due:
            {" "}
            {task.due_date ??
              "No Due Date"}
          </p>
        </div>

        <div className="mt-8">
        <TaskComments taskId={task.id} />
        </div>

        <div className="mt-8">
        <TaskAttachments taskId={task.id} />
        </div>

        <div className="mt-8">
        <TaskSubtasks taskId={task.id} />
        </div>

      </div>
    </DashboardLayout>
  );
}

export default TaskDetailsPage;