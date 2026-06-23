import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, ArrowLeft, Lock, Sun, Moon } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { forgotPassword, verifyResetOTP } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [glowIndex, setGlowIndex] = useState(-1);
  const [glowColor, setGlowColor] = useState<"success" | "error" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendGlow, setResendGlow] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const runGlowSequence = useCallback((color: "success" | "error", onDone: () => void) => {
    let i = 0;
    setGlowColor(color);
    const interval = setInterval(() => {
      setGlowIndex(i);
      i++;
      if (i > 5) {
        clearInterval(interval);
        setGlowIndex(-1);
        setGlowColor(null);
        onDone();
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("otp");
      setResendCooldown(60);
    } catch {
      setError("Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) void handleVerifyOTP(newOtp.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => d === "");
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) void handleVerifyOTP(pasted);
  };

  const handleVerifyOTP = async (otpValue: string) => {
    setLoading(true);
    try {
      const data = await verifyResetOTP(email, otpValue);
      runGlowSequence("success", () => navigate("/reset-password-otp", { state: { uid: data.uid } }));
    } catch {
      setError("Invalid or expired code. Please try again.");
      runGlowSequence("error", () => {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setGlowIndex(-1);
    setGlowColor(null);
    setResendGlow(true);
    try {
      await forgotPassword(email);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
      setTimeout(() => setResendGlow(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
            Forgot your<br />password?<br /><span className="text-indigo-400">No worries.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Enter your email and we'll send you a verification code to reset your password.
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 relative">Secure password recovery</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600"><Zap size={16} className="text-white" /></div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">DevFlow</span>
        </div>

        <div className="w-full max-w-sm">
          {step === "email" ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reset your password</h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Enter your email to receive a verification code</p>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>
              )}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <Input
                  id="forgot-email"
                  label="Email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={15} />}
                  required
                />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  Send Verification Code
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                Remember your password?{" "}
                <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-4 lg:mx-0">
                  <Lock size={24} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center lg:text-left">Enter verification code</h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 text-center lg:text-left">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>
              )}

              {/* OTP inputs */}
              <div className={`flex justify-center gap-2.5 mb-6 ${glowColor === "error" && glowIndex === 5 ? "animate-shake" : ""}`}>
                {otp.map((digit, i) => {
                  const isGlowing = glowIndex >= i && glowColor !== null;
                  const borderClass = !isGlowing
                    ? "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    : glowColor === "success"
                      ? "border-emerald-500 ring-[3px] ring-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                      : "border-rose-500 ring-[3px] ring-rose-500/40 shadow-[0_0_14px_rgba(244,63,94,0.45)]";
                  return (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      className={`w-11 h-12 text-center text-lg font-semibold rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 disabled:opacity-50 ${borderClass}`}
                    />
                  );
                })}
              </div>

              {loading && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-500 mb-4">Verifying...</p>
              )}

              <div className="text-center mb-6">
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className={`text-sm font-medium transition-all duration-300 rounded-lg px-3 py-1.5 ${resendGlow
                    ? "text-indigo-300 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    : "text-indigo-400 hover:text-indigo-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : resending
                      ? "Sending..."
                      : "Resend code"}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                <button onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Back to email
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
