import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Columns3,
  Bell,
  FileText,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 text-white p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        DevFlow
      </h1>

      <nav className="mt-10 space-y-2">
        <a
          href="/dashboard"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a
          href="/projects"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <FolderKanban size={20} />
          Projects
        </a>

        <a
          href="/teams"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <Users size={20} />
          Teams
        </a>

        <a
          href="/tasks"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <CheckSquare size={20} />
          Tasks
        </a>

        <a
        href="/kanban"
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
        <Columns3 size={20} />
        Kanban
        </a>

       <a
          href="/notifications"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <Bell size={20} />
          Notifications
        </a>

        <a
          href="/reports"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
        >
          <FileText size={20} />
          Reports
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;