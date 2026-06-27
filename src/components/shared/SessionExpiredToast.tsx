"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/src/app/context/CartContext";
import { LogIn, X } from "lucide-react";
import Link from "next/link";

export default function SessionExpiredToast() {
  const { sessionExpiredToast, dismissSessionToast } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionExpiredToast) {
      setVisible(true);
      // Auto-dismiss after 8 seconds
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(dismissSessionToast, 300);
      }, 8000);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [sessionExpiredToast, dismissSessionToast]);

  if (!sessionExpiredToast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 bg-[#1c4d35] text-white px-5 py-4 rounded-2xl shadow-2xl min-w-[320px] max-w-sm">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <LogIn size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Session expired</p>
          <p className="text-xs text-white/70 mt-0.5">You've been logged out after 1 hour of inactivity.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/signin"
            onClick={dismissSessionToast}
            className="text-xs bg-white text-[#1c4d35] font-semibold px-3 py-1.5 rounded-full hover:bg-white/90 transition"
          >
            Sign in
          </Link>
          <button
            onClick={() => { setVisible(false); setTimeout(dismissSessionToast, 300); }}
            className="text-white/60 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
