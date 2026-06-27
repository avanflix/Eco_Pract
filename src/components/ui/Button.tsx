import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const base = "px-6 py-3 rounded-full font-medium transition";
  const styles = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]",
    outline: "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
