import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  todo: number;
  inProgress: number;
  done: number;
};

function TaskStatusChart({
  todo,
  inProgress,
  done,
}: Props) {
  const data = [
    {
      name: "Todo",
      value: todo,
    },
    {
      name: "In Progress",
      value: inProgress,
    },
    {
      name: "Done",
      value: done,
    },
  ];

  const COLORS = [
    "#3B82F6",
    "#F59E0B",
    "#10B981",
  ];

  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-bold text-white">
        Tasks by Status
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

export default TaskStatusChart;