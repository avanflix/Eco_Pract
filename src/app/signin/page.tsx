"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const { login, register, logout, isLoggedIn, userEmail, userName } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    if (mode === "register" && form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen pt-36 pb-20 flex items-center justify-center bg-[var(--background)]">
        <div className="bg-white rounded-3xl p-10 shadow-lg text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-white" />
          </div>
          <h2 className="font-display text-3xl font-semibold">Welcome back!</h2>
          <p className="text-[var(--text-secondary)] mt-2">{userName}</p>
          <p className="text-sm text-[var(--text-secondary)]">{userEmail}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/" className="bg-[var(--primary)] text-white py-3 rounded-full font-medium text-center hover:bg-[var(--primary-light)] transition">
              Go Shopping
            </Link>
            <Link href="/profile" className="border border-[var(--border)] py-3 rounded-full font-medium text-center hover:border-[var(--primary)] transition">
              My Profile
            </Link>
            <Link href="/cart" className="border border-[var(--border)] py-3 rounded-full font-medium text-center hover:border-[var(--primary)] transition">
              View Cart & Orders
            </Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 py-2">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-20 flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-[var(--primary)]" />
            <span className="font-display text-2xl font-semibold text-[var(--primary)]">EcoPract</span>
          </div>
          <h1 className="font-display text-4xl font-semibold">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            {mode === "signin"
              ? "Sign in to track orders and manage your cart"
              : "Join thousands of eco-conscious customers"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[var(--border)]">
          {/* Mode Toggle */}
          <div className="flex bg-[var(--background)] rounded-full p-1 mb-8">
            {(["signin", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${mode === m ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                {m === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input type="text" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                {mode === "signin" && (
                  <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Enter password" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2 disabled:opacity-70">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
