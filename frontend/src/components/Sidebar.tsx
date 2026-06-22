import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Users, CheckSquare,
  Columns3, Bell, FileText, ChevronLeft, ChevronRight, Zap, LogOut,
} from "lucide-react";
import Avatar from "./Avatar";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function getUsername(): string {
  return localStorage.getItem("username") || "User";
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/projects",  label: "Projects",  Icon: FolderKanban },
  { href: "/teams",     label: "Teams",     Icon: Users },
  { href: "/tasks",     label: "Tasks",     Icon: CheckSquare },
  { href: "/kanban",    label: "Kanban",    Icon: Columns3 },
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/reports",   label: "Reports",   Icon: FileText },
];

export default function Sidebar({
  collapsed, onToggleCollapse, mobileOpen, onMobileClose,
}: SidebarProps) {
  const username = getUsername();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          h-screen sticky top-0
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-all duration-250 ease-in-out shrink-0
          ${collapsed ? "w-[72px]" : "w-[240px]"}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          username={username}
          onToggleCollapse={onToggleCollapse}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex flex-col w-[240px]
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transform transition-transform duration-250 ease-in-out
          lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent
          collapsed={false}
          username={username}
          onToggleCollapse={onMobileClose}
          onLogout={handleLogout}
          isMobile
        />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed, username, onToggleCollapse, onLogout, isMobile = false,
}: {
  collapsed: boolean;
  username: string;
  onToggleCollapse: () => void;
  onLogout: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex flex-col h-full py-4">
      {/* Logo + collapse button */}
      <div className={`flex items-center px-4 mb-6 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">DevFlow</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-none mt-0.5">Project Management</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap size={16} className="text-white" />
          </Link>
        )}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-lg px-2.5 py-2
              text-sm font-medium transition-all duration-150 group
              ${isActive
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={`shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:hover:text-slate-300"}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`px-3 pt-3 border-t border-slate-200 dark:border-slate-800 mt-2`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <Avatar name={username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">Member</p>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button onClick={onLogout} title="Logout" className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}