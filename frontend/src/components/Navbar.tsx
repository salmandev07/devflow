import { Menu, Bell, LogOut, Sun, Moon, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onMobileMenuToggle: () => void;
  mobileOpen: boolean;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":     { title: "Dashboard",     subtitle: "Overview of your workspace" },
  "/projects":      { title: "Projects",      subtitle: "Manage all your projects" },
  "/tasks":         { title: "Tasks",         subtitle: "Track and manage tasks" },
  "/teams":         { title: "Teams",         subtitle: "Manage teams and members" },
  "/kanban":        { title: "Kanban Board",  subtitle: "Visual task management" },
  "/notifications": { title: "Notifications", subtitle: "Your recent notifications" },
  "/reports":       { title: "Reports",       subtitle: "Analytics and insights" },
};

function getUsername(): string {
  return localStorage.getItem("username") || "User";
}

export default function Navbar({ onMobileMenuToggle, mobileOpen }: NavbarProps) {
  const { pathname } = useLocation();
  const username = getUsername();
  const { theme, toggleTheme } = useTheme();

  // Match longest prefix for nested routes like /projects/5
  const matchedKey = Object.keys(pageTitles)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  const pageInfo = matchedKey
    ? pageTitles[matchedKey]
    : { title: "DevFlow", subtitle: "" };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 px-4 lg:px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Page title — desktop */}
      <div className="hidden sm:flex flex-col">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{pageInfo.title}</span>
        {pageInfo.subtitle && (
          <span className="text-xs text-slate-500 dark:text-slate-500 leading-tight">{pageInfo.subtitle}</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <Link
        to="/notifications"
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
      </Link>

      {/* User + logout */}
      <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
        <Avatar name={username} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">{username}</span>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}