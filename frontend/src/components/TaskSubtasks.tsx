import { useEffect, useState } from "react";
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../services/subtaskService";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Props {
  taskId: number;
}

const TaskSubtasks = ({ taskId }: Props) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [title, setTitle] = useState("");

  const loadSubtasks = async () => {
    try {
      const data = await getSubtasks(taskId);
      setSubtasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const loadSubtasks = async () => {
    try {
      const data = await getSubtasks(taskId);
      setSubtasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  void loadSubtasks();
}, [taskId]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createSubtask(taskId, title);

    setTitle("");

    loadSubtasks();
  };

  const handleToggle = async (
    id: number,
    completed: boolean
  ) => {
    await updateSubtask(id, {
      completed: !completed,
    });

    loadSubtasks();
  };

  const handleDelete = async (id: number) => {
    await deleteSubtask(id);

    loadSubtasks();
  };

  const completedCount = subtasks.filter(
    (s) => s.completed
  ).length;

  const progress =
    subtasks.length === 0
      ? 0
      : Math.round(
          (completedCount / subtasks.length) * 100
        );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">
        Subtasks
      </h2>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Create subtask..."
            className="text-white border rounded px-3 py-2 flex-1"
          />

          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium">
          Progress: {progress}%
        </p>

        <div className="w-full bg-gray-200 rounded h-3 mt-2">
          <div
            className="bg-green-500 h-3 rounded"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() =>
                  handleToggle(
                    subtask.id,
                    subtask.completed
                  )
                }
              />

              <span
                className={
                  subtask.completed
                    ? "line-through text-red-500"
                    : ""
                }
              >
                {subtask.title}
              </span>
            </div>

            <button
              onClick={() =>
                handleDelete(subtask.id)
              }
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSubtasks;