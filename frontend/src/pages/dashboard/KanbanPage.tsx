import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { getTasks, updateTask } from "../../services/taskService";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    progress: tasks.filter((t) => t.status === "progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = Number(result.draggableId);
    const newStatus = result.destination.droppableId;

    try {
      await updateTask(taskId, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Kanban Board
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-3 gap-6">

          {Object.entries(columns).map(
            ([columnId, columnTasks]) => (
              <Droppable
                key={columnId}
                droppableId={columnId}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 rounded-xl p-4 min-h-[500px]"
                  >
                    <h2 className="font-bold text-lg mb-4 capitalize">
                      {columnId === "progress"
                        ? "In Progress"
                        : columnId}
                    </h2>

                    {columnTasks.map(
                      (task, index) => (
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
                              className="bg-white rounded-lg p-4 mb-3 shadow hover:shadow-lg transition"
                            >
                              <h3 className="font-semibold">
                                {task.title}
                              </h3>

                              <p className="text-sm text-gray-600 mt-2">
                                {task.description}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      )
                    )}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;