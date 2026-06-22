import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getTasks, updateTask } from "../../services/taskService";
import { PriorityBadge } from "../../components/Badge";
import Avatar from "../../components/Avatar";
import { SkeletonKanbanBoard } from "../../components/SkeletonLoader";

interface Task {
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
  assigned_to_username?: string;
  due_date: string | null;
}

const columnConfig = {
  todo: {
    label: "To Do",
    dot: "bg-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900",
    dropBg: "bg-slate-100 dark:bg-slate-800",
    headerBg: "bg-slate-100 dark:bg-slate-800",
  },
  progress: {
    label: "In Progress",
    dot: "bg-amber-400",
    bg: "bg-amber-50/30 dark:bg-amber-500/5",
    dropBg: "bg-amber-100/50 dark:bg-amber-500/10",
    headerBg: "bg-amber-50 dark:bg-amber-500/10",
  },
  done: {
    label: "Done",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50/30 dark:bg-emerald-500/5",
    dropBg: "bg-emerald-100/50 dark:bg-emerald-500/10",
    headerBg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
} as const;

type ColKey = keyof typeof columnConfig;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const fetchTasks = async () => {
    try {
      setTasks(await getTasks());
    } catch (error) {
      console.error(error);
    }
  };

  const columns: Record<ColKey, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    progress: tasks.filter((t) => t.status === "progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = Number(result.draggableId);
    const newStatus = result.destination.droppableId;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error(error);
      await fetchTasks();
    }
  };

  return (
    <DashboardLayout>
      <div className="page-enter min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag and drop tasks to update status
          </p>
        </div>

        {loading ? (
          <SkeletonKanbanBoard />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid gap-4 md:grid-cols-3 items-start">
              {(Object.keys(columnConfig) as ColKey[]).map((colId) => {
                const column = columnConfig[colId];
                const columnTasks = columns[colId];

                return (
                  <Droppable key={colId} droppableId={colId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[550px] rounded-xl border p-3 ${
                          snapshot.isDraggingOver
                            ? `${column.dropBg} border-indigo-300 dark:border-indigo-500/30`
                            : `border-slate-200 dark:border-slate-800 ${column.bg}`
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {column.label}
                            </span>
                          </div>
                          <span className="flex min-w-[22px] items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 text-xs">
                            {columnTasks.length}
                          </span>
                        </div>

                        {columnTasks.length === 0 && (
                          <div className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Drop tasks here
                            </p>
                          </div>
                        )}

                        {columnTasks.map((task, index) => {
                          const overdue =
                            task.due_date &&
                            new Date(task.due_date) < new Date() &&
                            task.status !== "done";

                          return (
                            <Draggable
                              key={task.id}
                              draggableId={String(task.id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style}
                                  className={`mb-3 rounded-xl border bg-white dark:bg-slate-950 p-4 ${
                                    snapshot.isDragging
                                      ? "shadow-2xl border-indigo-400 dark:border-indigo-500/50 ring-2 ring-indigo-400/20"
                                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                                  }`}
                                >
                                  <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {task.title}
                                  </h3>

                                  {task.description && (
                                    <p className="mb-3 text-xs text-slate-500 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="mb-3 flex items-center justify-between">
                                    <PriorityBadge priority={task.priority} />
                                    {task.assigned_to_username && (
                                      <Avatar
                                        name={task.assigned_to_username}
                                        size="xs"
                                      />
                                    )}
                                  </div>

                                  {task.project_name && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                      {task.project_name}
                                    </p>
                                  )}

                                  {task.team_name && (
                                    <p className="mt-1 text-[10px] text-cyan-400">
                                      {task.team_name}
                                    </p>
                                  )}

                                  {task.due_date && (
                                    <div
                                      className={`mt-3 flex items-center gap-1 text-[10px] ${
                                        overdue
                                          ? "text-rose-400"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      <span>{formatDate(task.due_date)}</span>
                                      {overdue && (
                                        <span className="ml-1 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] uppercase">
                                          Overdue
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </DashboardLayout>
  );
}
