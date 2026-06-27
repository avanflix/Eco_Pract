"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        items-center
        gap-3
        bg-white
        rounded-full
        px-5
        py-4
        shadow-xl
        border
        border-gray-100
        hover:scale-105
        transition-all
      "
    >
      <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white">
        <MessageCircle size={22} />
      </div>

      <div className="hidden sm:block">
        <p className="font-semibold text-sm">
          Need Help?
        </p>

        <p className="text-xs text-gray-500">
          Chat on WhatsApp
        </p>
      </div>
    </a>
  );
}