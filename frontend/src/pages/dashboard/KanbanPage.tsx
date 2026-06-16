import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import type { DropResult } from "@hello-pangea/dnd";

import { getTasks, updateTask } from "../../services/taskService";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: number | null;
  assigned_to_username?: string;
}

const getInitials = (username?: string) => {
  if (!username) return "?";

  return username.substring(0, 2).toUpperCase();
};

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadTasks();
  }, []);

  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    progress: tasks.filter((task) => task.status === "progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = Number(result.draggableId);

    const newStatus = result.destination.droppableId;

    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
          }
        : task,
    );

    setTasks(updatedTasks);

    try {
      await updateTask(taskId, {
        status: newStatus,
      });
    } catch (error) {
      console.error(error);

      await fetchTasks();
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Kanban Board</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(columns).map(([columnId, columnTasks]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-125 rounded-xl bg-gray-100 p-4"
                >
                  <h2 className="mb-4 text-lg font-bold capitalize">
                    {columnId === "progress" ? "In Progress" : columnId}
                  </h2>

                  {columnTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="
  mb-3
  rounded-xl
  border
  border-gray-200
  bg-white
  p-4
  shadow-sm
  transition-all
  duration-200
  hover:-translate-y-1
  hover:shadow-lg
"
                        >
                          <h3 className="font-semibold">{task.title}</h3>

                          <div className="mt-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            {task.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            {task.assigned_to_username ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-blue-600
                                        text-xs
                                        font-bold
                                        text-white
                                      "
                                  >
                                    {getInitials(task.assigned_to_username)}
                                  </div>

                                  <span className="text-xs text-gray-500">
                                    {task.assigned_to_username}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;
