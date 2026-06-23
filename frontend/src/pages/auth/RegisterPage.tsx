import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { registerUser } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

function getPasswordStrength(pwd: string): { level: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: score, label: "Weak",   color: "bg-rose-500" };
  if (score === 2) return { level: score, label: "Fair",   color: "bg-amber-400" };
  if (score === 3) return { level: score, label: "Good",   color: "bg-emerald-400" };
  return              { level: score, label: "Strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username, email, password });
      navigate("/verify-email", { state: { username, email } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      if (data?.username) {
        setError(`Username "${username}" is already taken.`);
      } else if (data?.email) {
        setError(`Email "${email}" is already registered.`);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">DevFlow</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
            Join the team.<br />
            Build together.<br />
            <span className="text-indigo-400">Ship faster.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Create your free account and start managing projects with your team today.
          </p>

          <div className="mt-8 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={20} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Secure by default</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your data is protected with JWT authentication and industry-standard security practices.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500 relative">Free to use · No credit card required</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">DevFlow</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create your account</h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Join DevFlow and start managing projects</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reg-username"
              label="Username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={15} />}
              required
            />

            <Input
              id="reg-email"
              label="Email"
              type="email"
              placeholder="john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={15} />}
              required
            />

            {/* Password with strength meter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2.5 pl-10 pr-10 outline-none transition-all duration-150"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.level ? strength.color : "bg-slate-100 dark:bg-slate-800"}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength.level <= 1 ? "text-rose-400" : strength.level === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              id="reg-confirm"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={15} />}
              error={confirmPassword && confirmPassword !== password ? "Passwords do not match" : undefined}
              required
            />

            <Button type="submit" variant="primary" size="lg" loading={loading}
              icon={!loading ? <ArrowRight size={15} /> : undefined}
              className="w-full mt-2 flex-row-reverse">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}