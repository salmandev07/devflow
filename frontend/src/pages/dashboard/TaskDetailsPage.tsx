import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTask, startTimer, stopTimer, getTimerStatus, getTaskSessions } from "../../services/taskService";
import TaskComments from "../../components/TaskComments";
import TaskAttachments from "../../components/TaskAttachments";
import TaskSubtasks from "../../components/TaskSubtasks";


type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;

  estimated_hours: number;
  actual_hours: number;
  due_date?: string | null;

  project_name?: string;
  team_name?: string;

  assigned_username?: string;
  
};

type TimeSession = {
  id: number;

  username: string;

  started_at: string;

  ended_at: string | null;

  duration_hours: string;
};

function TaskDetailsPage() {
  const { id } = useParams();

  const [task, setTask] =
    useState<Task | null>(null);

  const [timerLoading, setTimerLoading] =
  useState(false);

  const [timerRunning, setTimerRunning] =
  useState(false);

  const [sessions, setSessions] =
  useState<TimeSession[]>([]);


  useEffect(() => {
  const loadTask = async () => {
    try {
      const data = await getTask(
        Number(id)
      );

      const status =
        await getTimerStatus(
          Number(id)
        );

      const sessionData =
        await getTaskSessions(
          Number(id)
        );

      setTask(data);

      setTimerRunning(
        status.running
      );

      setSessions(
        sessionData
      );
    } catch (error) {
      console.error(error);
    }
  };

  void loadTask();
}, [id]);

  const efficiency =
  task?.estimated_hours &&
  task.estimated_hours > 0
    ? Math.round(
        (task.actual_hours /
          task.estimated_hours) *
          100
      )
    : 0;

  const handleStartTimer = async () => {
  if (!task) return;

  try {
    setTimerLoading(true);

    await startTimer(task.id);
    
    setTimerRunning(true);
    alert("Timer started");
  } catch (error) {
    console.error(error);
    alert("Unable to start timer");
  } finally {
    setTimerLoading(false);
  }
};

const handleStopTimer = async () => {

  if (!task) return;

  try {
    setTimerLoading(true);

    const result =
      await stopTimer(task.id);
      setTimerRunning(false);

    alert(
      `Added ${result.hours_added} hours`
    );

    const updatedTask =
      await getTask(task.id);

    setTask(updatedTask);
  } catch (error) {
    console.error(error);
    alert("Unable to stop timer");
  } finally {
    setTimerLoading(false);
  }
};

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

        <div className="mb-4">
          {timerRunning ? (
            <span
              className="
                rounded-full
                bg-green-600
                px-4
                py-2
                text-white
              "
            >
              🟢 Timer Running
            </span>
          ) : (
            <span
              className="
                rounded-full
                bg-slate-700
                px-4
                py-2
                text-white
              "
            >
              ⚪ Timer Stopped
            </span>
          )}
        </div>


        <div className="mb-6 flex gap-4">
          <button
            onClick={handleStartTimer}
            disabled={timerLoading}
            className="
              rounded-xl
              bg-green-600
              px-4
              py-2
              text-white
            "
          >
            ▶ Start Timer
          </button>

          <button
            onClick={handleStopTimer}
            disabled={timerLoading}
            className="
              rounded-xl
              bg-red-600
              px-4
              py-2
              text-white
            "
          >
            ■ Stop Timer
          </button>
        </div>

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

          <p className="text-green-400">
            Estimated Hours:
            {" "}
            {task.estimated_hours}h
          </p>

          <p className="text-cyan-400">
            Actual Hours:
            {" "}
            {task.actual_hours}h
          </p>

          <p className="text-yellow-400">
            Time Used:
            {" "}
            {efficiency}%
          </p>
        </div>

        <div className="mt-8">
          <h2
            className="
              text-xl
              font-bold
              text-white
              mb-4
            "
          >
            Session History
          </h2>

          <div className="space-y-3">
            {sessions.map(
              (session) => (
                <div
                  key={session.id}
                  className="
                    rounded-xl
                    bg-slate-800
                    p-4
                  "
                >
                  <p className="text-white">
                    {session.username}
                  </p>

                  <p className="text-slate-400">
                    Start:
                    {" "}
                    {new Date(
                      session.started_at
                    ).toLocaleString()}
                  </p>

                  <p className="text-slate-400">
                    End:
                    {" "}
                    {session.ended_at
                      ? new Date(
                          session.ended_at
                        ).toLocaleString()
                      : "Running"}
                  </p>

                  <p className="text-green-400">
                    Duration:
                    {" "}
                    {
                      session.duration_hours
                    }h
                  </p>
                </div>
              )
            )}
          </div>
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