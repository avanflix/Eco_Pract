"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf, Mail, ArrowLeft, CheckCircle2, Loader2, ShieldCheck,
  Lock, Eye, EyeOff, XCircle, RotateCcw,
} from "lucide-react";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  // Email step
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // OTP step
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password step
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setEmailError("");
    if (!email) { setEmailError("Please enter your email address."); return; }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep("otp");
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setEmailError(err.message || "Something went wrong. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      setOtpError("");
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    setOtpError("");
    if (otpString.length < 6) { setOtpError("Please enter all 6 digits."); return; }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResetToken(data.resetToken);
      setStep("password");
    } catch (err: any) {
      setOtpError(err.message || "Verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    if (!password) { setPassError("Please enter a new password."); return; }
    if (password.length < 6) { setPassError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setPassError("Passwords do not match."); return; }

    setPassLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep("done");
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err: any) {
      setPassError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setPassLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const strength =
    password.length >= 12 ? "Strong" :
    password.length >= 8  ? "Fair"   :
    password.length >= 6  ? "Weak"   : "Too short";
  const strengthColor =
    strength === "Strong" ? "bg-green-500" :
    strength === "Fair"   ? "bg-yellow-400" : "bg-red-400";

  const inputCls =
    "w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition text-sm";

  // ── Step indicator ────────────────────────────────────────────────────────
  const steps = ["Email", "Verify OTP", "New Password"];
  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="min-h-screen pt-36 pb-20 flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-[var(--primary)]" />
            <span className="font-display text-2xl font-semibold text-[var(--primary)]">EcoPract</span>
          </div>
          <h1 className="font-display text-4xl font-semibold">Forgot Password</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            We'll send a 6-digit OTP to your registered email
          </p>
        </div>

        {/* Step Indicator (hide on done) */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                  i < stepIndex ? "text-green-500" :
                  i === stepIndex ? "text-[var(--primary)]" :
                  "text-[var(--text-secondary)]"
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    i < stepIndex ? "bg-green-500 border-green-500 text-white" :
                    i === stepIndex ? "bg-[var(--primary)] border-[var(--primary)] text-white" :
                    "border-[var(--border)] text-[var(--text-secondary)]"
                  }`}>
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px ${i < stepIndex ? "bg-green-400" : "bg-[var(--border)]"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[var(--border)]">

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="text-[var(--primary)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter the email address linked to your account
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    autoFocus
                  />
                </div>
              </div>
              {emailError && (
                <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {emailLoading && <Loader2 size={18} className="animate-spin" />}
                Send OTP
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-[var(--primary)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  We sent a 6-digit code to
                </p>
                <p className="font-semibold text-sm mt-1">{email}</p>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition ${
                      digit ? "border-[var(--primary)] bg-[var(--primary)]/5" :
                      "border-[var(--border)] bg-[var(--background)]"
                    } focus:border-[var(--primary)]`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || otp.join("").length < 6}
                className="w-full bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {otpLoading && <Loader2 size={18} className="animate-spin" />}
                Verify OTP
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)]">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || emailLoading}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline disabled:text-[var(--text-secondary)] disabled:no-underline disabled:cursor-not-allowed transition"
                >
                  <RotateCcw size={13} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
                className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition"
              >
                ← Change email
              </button>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} className="text-[var(--primary)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">OTP verified! Set your new password.</p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= i * 3 ? strengthColor : "bg-[var(--border)]"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[var(--text-secondary)] ml-1">{strength}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <XCircle size={12} /> Passwords don't match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 6 && (
                  <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </div>

              {passError && (
                <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={passLoading}
                className="w-full bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {passLoading && <Loader2 size={18} className="animate-spin" />}
                Reset Password
              </button>
            </form>
          )}

          {/* ── DONE ── */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-3">Password Updated!</h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-[var(--text-secondary)] text-xs mb-6">Redirecting you to sign in…</p>
              <Link
                href="/signin"
                className="text-sm text-[var(--primary)] font-medium hover:underline"
              >
                Go to Sign In →
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition"
          >
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
