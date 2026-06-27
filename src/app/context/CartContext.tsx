"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

export type OrderTier = "normal" | "bulk1000" | "bulk5000" | "premium";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  pricePerPlate: number;
  pricePerPack: number;
  packSize: number;
  quantity: number;
  tier: OrderTier;
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string | null;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  status: "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  date: string;
  estimatedDelivery: string;
  cancellationReason?: string | null;
  paymentStatus?: string;
  shippingAddress?: any;
  paymentMethod?: string;
};

const SESSION_DURATION_MS = 60 * 60 * 1000;
const SESSION_KEY = "ep_user";
const CART_KEY = "ep_cart";

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  orders: Order[];
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  userId: string;
  userRole: string;
  sessionExpiredToast: boolean;
  dismissSessionToast: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (slug: string, tier: OrderTier) => void;
  increaseQuantity: (slug: string, tier: OrderTier) => void;
  decreaseQuantity: (slug: string, tier: OrderTier) => void;
  getItemQuantity: (slug: string, tier: OrderTier) => number;
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  placeOrderFull: (opts: {
    shippingAddress: any;
    paymentMethod: "stripe" | "cod";
    subtotal: number;
    discountCode?: string | null;
    discountAmount?: number;
    taxRate?: number;
    taxAmount?: number;
    total: number;
  }) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchOrders: () => Promise<void>;
  authError: string;
};

const CartContext = createContext<CartContextType | null>(null);

// ─── helpers ────────────────────────────────────────────────────────────────

async function persistCartToServer(userId: string, cart: CartItem[]) {
  try {
    await fetch("/api/user/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cart }),
    });
  } catch {
    // silent — localStorage is the fallback
  }
}

async function loadCartFromServer(userId: string): Promise<CartItem[] | null> {
  try {
    const res = await fetch(`/api/user/cart?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data;
  } catch { }
  return null;
}

// ─── provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("customer");
  const [authError, setAuthError] = useState("");
  const [sessionExpiredToast, setSessionExpiredToast] = useState(false);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether the initial hydration from localStorage/server is done
  const hydratedRef = useRef(false);

  const dismissSessionToast = () => setSessionExpiredToast(false);

  const doLogout = useCallback((reason: "manual" | "expired" = "manual") => {
    setIsLoggedIn(false);
    setUserEmail(""); setUserName(""); setUserId(""); setUserRole("customer");
    setOrders([]);
    // Clear cart on logout — both in state and localStorage
    setCart([]);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(SESSION_KEY);
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (reason === "expired") setSessionExpiredToast(true);
  }, []);

  const scheduleAutoLogout = useCallback((loginAt: number) => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    const remaining = loginAt + SESSION_DURATION_MS - Date.now();
    if (remaining <= 0) { doLogout("expired"); return; }
    sessionTimerRef.current = setTimeout(() => doLogout("expired"), remaining);
  }, [doLogout]);

  // ── Boot: restore session + load cart ──────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const u = JSON.parse(raw);
          const loginAt = u.loginAt || Date.now();
          if (Date.now() - loginAt >= SESSION_DURATION_MS) {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(CART_KEY);
          } else {
            setIsLoggedIn(true);
            setUserEmail(u.email); setUserName(u.name);
            setUserId(u.id || ""); setUserRole(u.role || "customer");
            scheduleAutoLogout(loginAt);

            // Load cart from server (authoritative for logged-in users)
            const serverCart = await loadCartFromServer(u.id);
            if (serverCart !== null) {
              setCart(serverCart);
              localStorage.setItem(CART_KEY, JSON.stringify(serverCart));
            } else {
              // Fall back to localStorage if server unreachable
              const cartRaw = localStorage.getItem(CART_KEY);
              if (cartRaw) setCart(JSON.parse(cartRaw));
            }
          }
        } else {
          // Guest — just restore from localStorage
          const cartRaw = localStorage.getItem(CART_KEY);
          if (cartRaw) setCart(JSON.parse(cartRaw));
        }
      } catch { }
      hydratedRef.current = true;
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync cart: localStorage always, DB when logged in ──────────────────────
  useEffect(() => {
    if (!hydratedRef.current) return; // skip the initial empty render
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (isLoggedIn && userId) {
      persistCartToServer(userId, cart);
    }
  }, [cart, isLoggedIn, userId]);

  // ── Fetch orders when logged in ────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && userEmail) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    return () => { if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current); };
  }, []);

  // ── Cart mutations ─────────────────────────────────────────────────────────

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.slug === item.slug && i.tier === item.tier);
      if (exists) {
        return prev.map((i) =>
          i.slug === item.slug && i.tier === item.tier ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (slug: string, tier: OrderTier) =>
    setCart((prev) => prev.filter((i) => !(i.slug === slug && i.tier === tier)));

  const increaseQuantity = (slug: string, tier: OrderTier) =>
    setCart((prev) =>
      prev.map((i) => i.slug === slug && i.tier === tier ? { ...i, quantity: i.quantity + 1 } : i)
    );

  const decreaseQuantity = (slug: string, tier: OrderTier) =>
    setCart((prev) =>
      prev
        .map((i) => i.slug === slug && i.tier === tier ? { ...i, quantity: i.quantity - 1 } : i)
        .filter((i) => i.quantity > 0)
    );

  const getItemQuantity = (slug: string, tier: OrderTier) =>
    cart.find((i) => i.slug === slug && i.tier === tier)?.quantity || 0;

  const clearCart = () => setCart([]);

  // ── Orders ─────────────────────────────────────────────────────────────────

  const detectRegion = (): "IN" | "US" => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith("America/")) return "US";
    } catch { }
    return "US";
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.pricePerPack * i.quantity, 0);
    const region = detectRegion();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail, userName, userId: userId || null, items: cart,
          subtotal, total: subtotal, region,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders((prev) => [data.data, ...prev]);
      clearCart();
    } catch {
      const fallback: Order = {
        id: `EP-${Date.now()}`, items: [...cart], subtotal,
        total: subtotal, status: "Processing",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        estimatedDelivery: new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      };
      setOrders((prev) => [fallback, ...prev]);
      clearCart();
    }
  };

  const placeOrderFull = async (opts: {
    shippingAddress: any;
    paymentMethod: "stripe" | "cod";
    subtotal: number;
    discountCode?: string | null;
    discountAmount?: number;
    taxRate?: number;
    taxAmount?: number;
    total: number;
  }) => {
    if (cart.length === 0) throw new Error("Cart is empty");
    const region = detectRegion();
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail, userName, userId: userId || null, items: cart,
        subtotal: opts.subtotal,
        discountCode: opts.discountCode || null,
        discountAmount: opts.discountAmount || 0,
        taxRate: opts.taxRate || 0,
        taxAmount: opts.taxAmount || 0,
        total: opts.total,
        shippingAddress: opts.shippingAddress,
        paymentMethod: opts.paymentMethod,
        region,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to place order");
    setOrders((prev) => [data.data, ...prev]);
    clearCart();
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, adminEmail: userEmail }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to cancel order");
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: "Cancelled", cancellationReason: reason } : o)
    );
  };

  const fetchOrders = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error("fetchOrders error:", err);
    }
  };

  // ── Auth ───────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    setAuthError("");
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) { setAuthError(data.message || "Login failed"); throw new Error(data.message); }
    const { id, name, role } = data.data;
    const loginAt = Date.now();

    // Load cart from server — server cart is authoritative on login
    const serverCart = await loadCartFromServer(id);
    const cartToUse = serverCart ?? cart; // fall back to current guest cart
    setCart(cartToUse);
    localStorage.setItem(CART_KEY, JSON.stringify(cartToUse));
    // If guest had items and server had none, push guest cart up
    if ((!serverCart || serverCart.length === 0) && cart.length > 0) {
      persistCartToServer(id, cart);
    }

    setIsLoggedIn(true); setUserEmail(email); setUserName(name);
    setUserId(id); setUserRole(role || "customer"); setSessionExpiredToast(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, id, role: role || "customer", loginAt }));
    scheduleAutoLogout(loginAt);
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthError("");
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) { setAuthError(data.message || "Registration failed"); throw new Error(data.message); }
    const { id } = data.data;
    const loginAt = Date.now();

    // New user — persist any guest cart to their account
    if (cart.length > 0) persistCartToServer(id, cart);

    setIsLoggedIn(true); setUserEmail(email); setUserName(name);
    setUserId(id); setUserRole("customer"); setSessionExpiredToast(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, id, role: "customer", loginAt }));
    scheduleAutoLogout(loginAt);
  };

  const logout = () => doLogout("manual");
  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount, orders, isLoggedIn, userEmail, userName, userId, userRole,
      sessionExpiredToast, dismissSessionToast,
      addToCart, removeFromCart, increaseQuantity, decreaseQuantity, getItemQuantity,
      clearCart, placeOrder, placeOrderFull, cancelOrder,
      login, register, logout, fetchOrders, authError,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}