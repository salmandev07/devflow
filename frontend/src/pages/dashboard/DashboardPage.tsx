import DashboardLayout from "../../layouts/DashboardLayout";

function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-slate-400 mt-2">
          Manage projects, teams and tasks.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-10">
        {[
          ["Projects", "0"],
          ["Teams", "0"],
          ["Tasks", "0"],
        ].map(([title, count]) => (
          <div
            key={title}
            className="
              bg-slate-900
              border border-slate-800
              rounded-2xl
              p-6
              hover:scale-105
              transition-all
              duration-300
              cursor-pointer
            "
          >
            <h3 className="text-slate-400">
              {title}
            </h3>

            <p className="text-4xl font-bold text-white mt-3">
              {count}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;