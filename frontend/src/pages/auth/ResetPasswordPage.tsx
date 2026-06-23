import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Zap, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Sun, Moon } from "lucide-react";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

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
      const res = await fetch(`${API_URL}/auth/reset-password/${uidb64}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
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
            Create a new<br />password.<br /><span className="text-indigo-400">Stay secure.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Choose a strong password to protect your account.
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 relative">Password reset expires in 1 hour</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600"><Zap size={16} className="text-white" /></div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">DevFlow</span>
        </div>
        <div className="w-full max-w-sm">
          {success ? (
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Password reset!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Your password has been successfully reset.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                <ArrowLeft size={14} /> Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Set new password</h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Enter your new password below</p>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
                    <input
                      id="reset-password"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2.5 pl-10 pr-10 outline-none transition-all duration-150"
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-confirm" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
                    <input
                      id="reset-confirm"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2.5 pl-10 pr-3 outline-none transition-all duration-150"
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-rose-400">Passwords do not match</p>
                  )}
                </div>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  Reset Password
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
