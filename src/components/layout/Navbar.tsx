"use client";
import Link from "next/link";
import { ShoppingBag, Menu, X, User, LogOut, Package, Settings } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/src/app/context/CartContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, isLoggedIn, userName, logout, orders, userRole } = useCart();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/#products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container-custom">
          <div className="mt-4">
            <div className="flex items-center justify-between rounded-full border border-white/50 bg-white/85 backdrop-blur-xl px-6 lg:px-8 py-4 shadow-lg">
              <Link href="/" className="font-display text-3xl font-semibold text-[var(--primary)]">
                EcoPract
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map(link => (
                  <Link key={link.name} href={link.href}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
                    {link.name}
                  </Link>
                ))}
                {isLoggedIn && (userRole === "admin" || userRole === "staff") && (
                  <Link href="/admin"
                    className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
                    <Settings size={14} /> Admin
                  </Link>
                )}
              </nav>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <div className="hidden lg:flex items-center gap-3">
                    {orders.length > 0 && (
                      <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline">
                        <Package size={16} /> Orders
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition">
                      <User size={15} /> {userName.split(" ")[0]}
                    </Link>
                    <button onClick={logout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/signin"
                    className="hidden lg:flex items-center gap-1 rounded-full border border-[var(--primary)] px-5 py-2.5 text-[var(--primary)] font-medium hover:bg-[var(--primary)] hover:text-white transition-colors text-sm">
                    <User size={15} /> Sign In
                  </Link>
                )}

                <Link href="/cart"
                  className="hidden lg:flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--primary-light)] transition">
                  <ShoppingBag size={18} />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>

                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 py-6 border-b">
            <h2 className="font-display text-2xl text-[var(--primary)]">EcoPract</h2>
            <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
          </div>
          <nav className="flex flex-col p-6">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="py-4 border-b text-lg">
                {link.name}
              </Link>
            ))}
            {isLoggedIn && (userRole === "admin" || userRole === "staff") && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="py-4 border-b text-lg flex items-center gap-2 text-[var(--primary)]">
                <Settings size={16} /> Admin Dashboard
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-4 border-b text-lg flex items-center gap-2">
                  <User size={16} /> My Profile
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mt-4 py-4 border-b text-lg text-left text-red-500 flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="py-4 border-b text-lg flex items-center gap-2">
                <User size={16} /> Sign In
              </Link>
            )}
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="mt-8 bg-[var(--primary)] text-white rounded-full py-4 text-center flex items-center justify-center gap-2">
              <ShoppingBag size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
