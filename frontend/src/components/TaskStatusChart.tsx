import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Props { todo: number; inProgress: number; done: number; }

const DATA_COLORS = ["#6366f1", "#f59e0b", "#10b981"];

export default function TaskStatusChart({ todo, inProgress, done }: Props) {
  const data = [
    { name: "To Do",       value: todo },
    { name: "In Progress", value: inProgress },
    { name: "Done",        value: done },
  ].filter((d) => d.value > 0);

  const total = todo + inProgress + done;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Task Status</h3>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{total} tasks total</p>
      </div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-500">No task data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={88}
              dataKey="value" paddingAngle={3} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={DATA_COLORS[i % DATA_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
              cursor={false}
            />
            <Legend
              iconType="circle" iconSize={8}
              formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-400">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}