import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props { low: number; medium: number; high: number; }

export default function TaskPriorityChart({ low, medium, high }: Props) {
  const data = [
    { name: "Low",    value: low,    color: "#64748b" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "High",   value: high,   color: "#f43f5e" },
  ];

  const total = low + medium + high;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Task Priority</h3>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{total} tasks distributed</p>
      </div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-500">No task data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={48} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
              cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}