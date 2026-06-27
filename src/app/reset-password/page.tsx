"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Validate token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/auth/validate-reset-token?token=${token}`)
      .then(r => r.json())
      .then(data => setTokenValid(data.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.password) { setError("Please enter a new password."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDone(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition text-sm";

  // Loading token validation
  if (tokenValid === null) {
    return (
      <div className="text-center py-12">
        <Loader2 size={32} className="animate-spin text-[var(--primary)] mx-auto mb-4" />
        <p className="text-[var(--text-secondary)] text-sm">Verifying your reset link…</p>
      </div>
    );
  }

  // Invalid / expired token
  if (tokenValid === false) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Link expired</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
          This password reset link is invalid or has expired.<br />
          Reset links are only valid for 1 hour.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-[var(--primary)] text-white px-8 py-3 rounded-full font-medium hover:bg-[var(--primary-light)] transition text-sm"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Password updated!</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
          Your password has been reset successfully.
        </p>
        <p className="text-[var(--text-secondary)] text-xs mb-6">Redirecting you to sign in…</p>
        <Link href="/signin" className="text-sm text-[var(--primary)] font-medium hover:underline">
          Go to Sign In →
        </Link>
      </div>
    );
  }

  // Reset form
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">New Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Strength indicator */}
        {form.password.length > 0 && (
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  form.password.length >= i * 3
                    ? form.password.length >= 12 ? "bg-green-500"
                    : form.password.length >= 8 ? "bg-yellow-400"
                    : "bg-red-400"
                    : "bg-[var(--border)]"
                }`}
              />
            ))}
            <span className="text-xs text-[var(--text-secondary)] ml-1">
              {form.password.length >= 12 ? "Strong" : form.password.length >= 8 ? "Fair" : form.password.length >= 6 ? "Weak" : "Too short"}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Confirm Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your new password"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.confirm && form.password !== form.confirm && (
          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
            <XCircle size={12} /> Passwords don't match
          </p>
        )}
        {form.confirm && form.password === form.confirm && form.password.length >= 6 && (
          <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={12} /> Passwords match
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Reset Password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen pt-36 pb-20 flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-[var(--primary)]" />
            <span className="font-display text-2xl font-semibold text-[var(--primary)]">EcoPract</span>
          </div>
          <h1 className="font-display text-4xl font-semibold">Set New Password</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[var(--border)]">
          <Suspense fallback={
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin text-[var(--primary)] mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <div className="text-center mt-6">
          <Link href="/signin" className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
