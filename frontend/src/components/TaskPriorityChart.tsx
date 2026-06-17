import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  low: number;
  medium: number;
  high: number;
};

function TaskPriorityChart({
  low,
  medium,
  high,
}: Props) {
  const data = [
    {
      name: "Low",
      value: low,
    },
    {
      name: "Medium",
      value: medium,
    },
    {
      name: "High",
      value: high,
    },
  ];

  const COLORS = [
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];

  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-bold text-white">
        Tasks by Priority
      </h2>

      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TaskPriorityChart;