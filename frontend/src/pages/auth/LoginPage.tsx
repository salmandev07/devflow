import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { loginUser } from "../../services/authService";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", username);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Real-time project tracking",
    "Kanban board with drag & drop",
    "Team collaboration tools",
    "Advanced analytics & reports",
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-10 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">DevFlow</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
            Ship faster.<br />
            Stay organized.<br />
            <span className="text-indigo-400">Stay in flow.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
            The modern project management platform built for engineering teams that move fast.
          </p>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="text-xs text-slate-500 dark:text-slate-500 relative">
          Built for developers, by developers.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">DevFlow</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Sign in to your workspace</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-username"
              label="Username"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<Mail size={15} />}
              required
              autoComplete="username"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2.5 pl-10 pr-10 outline-none transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={!loading ? <ArrowRight size={15} /> : undefined}
              className="w-full mt-2 flex-row-reverse"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}