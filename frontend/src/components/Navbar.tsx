import { useState, useRef, useEffect } from "react";
import { Menu, Bell, LogOut, Sun, Moon, X, ChevronDown, Settings, User as UserIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { useTheme } from "../context/ThemeContext";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { useAuth } from "../context/AuthContext";

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
  "/settings":      { title: "Settings",      subtitle: "Account & profile settings" },
};

export default function Navbar({ onMobileMenuToggle, mobileOpen }: NavbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const unreadCount = useUnreadCount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || localStorage.getItem("full_name") || localStorage.getItem("username") || "User";
  const avatarUrl = profile?.avatar || localStorage.getItem("avatar");

  // Match longest prefix for nested routes like /projects/5
  const matchedKey = Object.keys(pageTitles)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  const pageInfo = matchedKey
    ? pageTitles[matchedKey]
    : { title: "DevFlow", subtitle: "" };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    const savedTheme = localStorage.getItem("theme");
    localStorage.clear();
    if (savedTheme) localStorage.setItem("theme", savedTheme);
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
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User dropdown */}
      <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Avatar name={displayName} src={avatarUrl} size="sm" />
          <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{displayName}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1 z-50">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{profile?.email || ""}</p>
            </div>

            {/* Menu items */}
            <button
              onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UserIcon size={15} className="text-slate-400" />
              Profile Settings
            </button>
            <button
              onClick={() => { setDropdownOpen(false); navigate("/notifications"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell size={15} className="text-slate-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-[10px] font-semibold text-indigo-400">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings size={15} className="text-slate-400" />
              Settings
            </button>

            {/* Logout */}
            <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1">
              <button
                onClick={() => { setDropdownOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
