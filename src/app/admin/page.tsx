"use client";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Search, ChevronDown, ChevronUp, RefreshCw,
  XCircle, Check, AlertTriangle, X, Loader2, Package,
} from "lucide-react";
import Image from "next/image";

type AdminOrder = {
  _id: string; id: string; userEmail: string; userName: string;
  date: string; status: string; paymentStatus: string; total: number;
  items: any[]; cancellationReason?: string | null; cancelledAt?: string | null;
  cancelledBy?: string | null; stripeRefundId?: string | null;
  refundAmount?: number | null; refundedAt?: string | null;
  region: string; statusHistory: any[]; paymentIntentId?: string | null;
};

const STATUS_FLOW = ["Processing", "Confirmed", "Shipped", "Delivered"];
const CANCEL_REASONS_ADMIN = ["Customer requested", "Out of stock", "Fraud suspected", "Duplicate order", "Other"];

const statusColor: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-gray-100 text-gray-600 border-gray-200",
};

const payColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  refunded: "bg-gray-100 text-gray-600 border-gray-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const { isLoggedIn, userRole, userEmail } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");

  // Modals
  const [cancelModal, setCancelModal] = useState<{ open: boolean; orderId: string }>({ open: false, orderId: "" });
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS_ADMIN[0]);
  const [refundModal, setRefundModal] = useState<{ open: boolean; orderId: string; amount: number }>({ open: false, orderId: "", amount: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    if (isLoggedIn && userRole !== "admin" && userRole !== "staff") {
      router.push("/"); return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userRole]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?admin=true");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {}
    setLoading(false);
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminEmail: userEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showToast(`Order ${orderId} updated to ${status}`, "success");
    } catch (e: any) {
      showToast(e.message || "Failed to update status", "error");
    }
  };

  const confirmCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${cancelModal.orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, adminEmail: userEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders(prev => prev.map(o => o.id === cancelModal.orderId ? { ...o, status: "Cancelled", cancellationReason: cancelReason } : o));
      showToast(`Order ${cancelModal.orderId} cancelled`, "success");
      setCancelModal({ open: false, orderId: "" });
      // prompt refund if paid
      const order = orders.find(o => o.id === cancelModal.orderId);
      if (order?.paymentStatus === "paid") {
        setTimeout(() => setRefundModal({ open: true, orderId: order.id, amount: order.total }), 400);
      }
    } catch (e: any) {
      showToast(e.message || "Failed to cancel", "error");
    }
    setActionLoading(false);
  };

  const confirmRefund = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${refundModal.orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundAmount: refundModal.amount, adminEmail: userEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders(prev => prev.map(o => o.id === refundModal.orderId ? { ...o, status: "Refunded", paymentStatus: "refunded", stripeRefundId: data.refundId } : o));
      showToast(`Refund of $${refundModal.amount.toFixed(2)} processed`, "success");
      setRefundModal({ open: false, orderId: "", amount: 0 });
    } catch (e: any) {
      showToast(e.message || "Failed to process refund", "error");
    }
    setActionLoading(false);
  };

  const canCancel = (o: AdminOrder) => !["Cancelled", "Refunded", "Delivered"].includes(o.status);
  const canRefund = (o: AdminOrder) => o.paymentStatus === "paid" && ["Cancelled", "Delivered"].includes(o.status);

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (payFilter && o.paymentStatus !== payFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.userName.toLowerCase().includes(q) && !o.userEmail.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "Processing" || o.status === "Confirmed").length;
  const cancelled = orders.filter(o => o.status === "Cancelled" || o.status === "Refunded").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;

  if (loading) {
    return (
      <div className="min-h-screen pt-36 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <section className="pt-36 pb-24 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Package size={28} className="text-[var(--primary)]" />
            <h1 className="text-5xl font-display">Orders</h1>
            <span className="text-sm bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full font-medium">{orders.length} total</span>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-2 border border-[var(--border)] px-4 py-2.5 rounded-full text-sm hover:border-[var(--primary)] transition">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-[var(--primary)]" },
            { label: "Pending", value: pending, color: "text-amber-600" },
            { label: "Cancelled / Refunded", value: cancelled, color: "text-red-600" },
            { label: "Delivered", value: delivered, color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--border)] rounded-full focus:outline-none focus:border-[var(--primary)] bg-white"
              placeholder="Search order ID, name, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-full px-4 py-2.5 focus:outline-none focus:border-[var(--primary)] bg-white">
            <option value="">All statuses</option>
            {["Processing","Confirmed","Shipped","Delivered","Cancelled","Refunded"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-full px-4 py-2.5 focus:outline-none focus:border-[var(--primary)] bg-white">
            <option value="">All payments</option>
            {["pending","paid","refunded","failed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-[var(--text-secondary)]">No orders match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order._id} className="bg-white rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                {/* Row Header */}
                <div
                  className="flex flex-wrap items-center gap-4 px-6 py-5 cursor-pointer hover:bg-[var(--background)] transition"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="min-w-[90px]">
                    <p className="text-xs text-[var(--text-secondary)]">Order</p>
                    <p className="font-semibold text-sm">#{order.id}</p>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium text-sm">{order.userName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{order.userEmail}</p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="font-bold text-[var(--primary)]">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{order.region}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusColor[order.status] || ""}`}>{order.status}</span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${payColor[order.paymentStatus] || ""}`}>{order.paymentStatus}</span>
                  <p className="text-xs text-[var(--text-secondary)] ml-auto">{order.date}</p>
                  {expandedId === order.id ? <ChevronUp size={16} className="text-[var(--text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--text-secondary)]" />}
                </div>

                {/* Expanded Detail */}
                {expandedId === order.id && (
                  <div className="border-t border-[var(--border)] px-6 py-6">
                    {/* Items */}
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3 font-medium">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-[var(--background)] rounded-2xl p-3">
                            <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-xl object-cover h-12 w-12" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{item.tier} · {item.quantity} pack(s)</p>
                            </div>
                            <p className="font-semibold text-sm">${(item.pricePerPack * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3 font-medium">Status History</h4>
                      <div className="space-y-2">
                        {order.statusHistory.length > 0 ? order.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                            <span className="text-[var(--text-secondary)]">{h.fromStatus ? `${h.fromStatus} → ` : ""}<span className="font-medium text-[var(--text-primary)]">{h.toStatus}</span></span>
                            {h.changedBy && <span className="text-[var(--text-secondary)]">by {h.changedBy}</span>}
                            {h.note && <span className="text-[var(--text-secondary)] italic">({h.note})</span>}
                          </div>
                        )) : <p className="text-xs text-[var(--text-secondary)]">No history recorded.</p>}
                      </div>
                    </div>

                    {/* Refund info */}
                    {order.stripeRefundId && (
                      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm">
                        <p className="font-medium text-gray-700">Stripe Refund ID: <span className="font-mono text-xs">{order.stripeRefundId}</span></p>
                        {order.refundAmount && <p className="text-gray-500 text-xs mt-1">Amount: ${order.refundAmount.toFixed(2)}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--border)]">
                      {/* Status Update */}
                      {!["Cancelled","Refunded","Delivered"].includes(order.status) && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-[var(--text-secondary)]">Update status:</label>
                          <select
                            className="text-sm border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--primary)] bg-white"
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                          >
                            {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      )}

                      {/* Cancel */}
                      {canCancel(order) && (
                        <button
                          onClick={() => { setCancelModal({ open: true, orderId: order.id }); setCancelReason(CANCEL_REASONS_ADMIN[0]); }}
                          className="flex items-center gap-2 text-sm text-red-500 border border-red-200 rounded-full px-4 py-1.5 hover:bg-red-50 hover:border-red-400 transition"
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      )}

                      {/* Refund */}
                      {canRefund(order) && (
                        <button
                          onClick={() => setRefundModal({ open: true, orderId: order.id, amount: order.total })}
                          className="flex items-center gap-2 text-sm text-purple-600 border border-purple-200 rounded-full px-4 py-1.5 hover:bg-purple-50 hover:border-purple-400 transition"
                        >
                          <RefreshCw size={14} /> Stripe Refund
                        </button>
                      )}

                      {order.paymentStatus === "refunded" && (
                        <span className="text-xs text-green-600 flex items-center gap-1"><Check size={14} /> Refund issued</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <h3 className="font-display text-xl font-semibold">Cancel Order</h3>
              </div>
              <button onClick={() => setCancelModal({ open: false, orderId: "" })} className="text-[var(--text-secondary)]"><X size={20} /></button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5">Cancel order <span className="font-medium text-[var(--text-primary)]">#{cancelModal.orderId}</span>. If paid, you'll be prompted to issue a refund.</p>
            <div className="space-y-2 mb-6">
              {CANCEL_REASONS_ADMIN.map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${cancelReason === r ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"}`}>
                  <input type="radio" name="areason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-[var(--primary)]" />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({ open: false, orderId: "" })} className="flex-1 border border-[var(--border)] py-3 rounded-full text-sm">Keep Order</button>
              <button onClick={confirmCancel} disabled={actionLoading} className="flex-1 bg-red-500 text-white py-3 rounded-full text-sm hover:bg-red-600 disabled:opacity-70 flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={14} className="animate-spin" />} Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <RefreshCw size={20} className="text-purple-600" />
                </div>
                <h3 className="font-display text-xl font-semibold">Process Refund</h3>
              </div>
              <button onClick={() => setRefundModal({ open: false, orderId: "", amount: 0 })} className="text-[var(--text-secondary)]"><X size={20} /></button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5">Issue a Stripe refund for order <span className="font-medium text-[var(--text-primary)]">#{refundModal.orderId}</span>. The customer will receive funds within 5–10 business days.</p>
            <div className="mb-6">
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Refund Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] text-sm bg-[var(--background)]"
                value={refundModal.amount}
                onChange={e => setRefundModal(m => ({ ...m, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRefundModal({ open: false, orderId: "", amount: 0 })} className="flex-1 border border-[var(--border)] py-3 rounded-full text-sm">Cancel</button>
              <button onClick={confirmRefund} disabled={actionLoading} className="flex-1 bg-[var(--primary)] text-white py-3 rounded-full text-sm hover:bg-[var(--primary-light)] disabled:opacity-70 flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={14} className="animate-spin" />} Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 text-sm font-medium border ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <Check size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
          {toast.msg}
        </div>
      )}
    </section>
  );
}
