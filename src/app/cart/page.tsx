"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, ShoppingBag, Package, CheckCircle2, Truck, Clock, MapPin, XCircle, AlertTriangle, X, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState, useEffect, Suspense } from "react";

const statusSteps = ["Processing", "Confirmed", "Shipped", "Delivered"] as const;
const statusIcons = { Processing: Clock, Confirmed: CheckCircle2, Shipped: Truck, Delivered: MapPin };
const tierLabel: Record<string, string> = { normal: "Normal", bulk1000: "Bulk 1000", bulk5000: "Bulk 5000", premium: "Premium" };
const CANCEL_REASONS = ["Changed my mind", "Ordered by mistake", "Found a better price", "Delivery time too long", "Other"];

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, orders, isLoggedIn, clearCart, cancelOrder } = useCart();
  const [activeTab, setActiveTab] = useState<"cart" | "orders">(
    searchParams.get("tab") === "orders" ? "orders" : "cart"
  );
  const [cancelModal, setCancelModal] = useState<{ orderId: string; open: boolean }>({ orderId: "", open: false });
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setToast("Order placed successfully! Track it in the Orders tab.");
      setActiveTab("orders");
    }
  }, [searchParams]);

  const subtotal = cart.reduce((s, i) => s + i.pricePerPack * i.quantity, 0);

  const openCancel = (orderId: string) => {
    setCancelModal({ orderId, open: true });
    setCancelReason(CANCEL_REASONS[0]);
    setCancelError("");
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true); setCancelError("");
    try {
      await cancelOrder(cancelModal.orderId, cancelReason);
      setCancelModal({ orderId: "", open: false });
      showToast("Order cancelled successfully.");
    } catch (e: any) { setCancelError(e.message || "Failed to cancel order."); }
    finally { setCancelLoading(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const canCancel = (status: string) => !["Cancelled", "Refunded", "Delivered"].includes(status);

  return (
    <section className="pt-36 pb-24 min-h-screen">
      <div className="container-custom">
        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-5xl font-display">My Account</h1>
        </div>

        <div className="flex gap-2 mb-10 border-b border-[var(--border)]">
          {(["cart", "orders"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium rounded-t-xl border-b-2 transition ${activeTab === tab ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
              {tab === "cart" ? `Cart (${cart.length})` : `Orders (${orders.length})`}
            </button>
          ))}
        </div>

        {/* CART TAB */}
        {activeTab === "cart" && (
          <>
            {cart.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-display mb-3">Your cart is empty</h2>
                <p className="text-[var(--text-secondary)] mb-8">Add eco-friendly plates from our homepage.</p>
                <Link href="/#products" className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-4 rounded-full font-medium">
                  <ShoppingBag size={18} /> Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
                <div className="space-y-4">
                  {cart.map(item => (
                    // Key uses slug + tier to avoid duplicates when same product is added under different tiers
                    <div key={`${item.slug}__${item.tier}`} className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-5 flex gap-5 items-start">
                      <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-2xl object-cover h-24 w-24" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-1 rounded-full font-medium mt-1 inline-block">
                              {tierLabel[item.tier]} tier
                            </span>
                          </div>
                          <button onClick={() => removeFromCart(item.slug, item.tier)} className="text-red-400 hover:text-red-600 shrink-0">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-[var(--primary)] font-bold text-lg mt-2">${item.pricePerPack}/pack</p>
                        <p className="text-xs text-[var(--text-secondary)]">${item.pricePerPlate}/plate · pack of {item.packSize}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-full border border-[var(--primary)]">
                            <button onClick={() => decreaseQuantity(item.slug, item.tier)} className="flex h-9 w-9 items-center justify-center text-lg hover:bg-gray-50">−</button>
                            <span className="flex min-w-[36px] justify-center font-semibold text-sm">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.slug, item.tier)} className="flex h-9 w-9 items-center justify-center text-lg hover:bg-gray-50">+</button>
                          </div>
                          <p className="font-semibold text-sm">Subtotal: ${(item.pricePerPack * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8 h-fit sticky top-32">
                  <h2 className="text-2xl font-display font-semibold mb-6">Order Summary</h2>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Items</span>
                      <span>{cart.reduce((s, i) => s + i.quantity, 0)} packs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">Tax & discount applied at checkout</p>
                  </div>

                  {!isLoggedIn ? (
                    <div className="mt-6 space-y-3">
                      <p className="text-sm text-[var(--text-secondary)] text-center">Sign in to checkout</p>
                      <Link href="/signin?redirect=/checkout" className="block w-full text-center bg-[var(--primary)] text-white py-4 rounded-full font-medium hover:bg-[var(--primary-light)] transition">
                        Sign In to Checkout
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push("/checkout")}
                      className="w-full mt-6 bg-[var(--primary)] text-white py-4 rounded-full font-semibold hover:bg-[var(--primary-light)] transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} /> Checkout
                    </button>
                  )}

                  <button onClick={clearCart} className="w-full mt-3 text-sm text-red-400 hover:text-red-600 py-2">
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-24">
                <Package size={48} className="mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-display mb-3">No orders yet</h2>
                <p className="text-[var(--text-secondary)] mb-8">Place your first order to see it tracked here.</p>
                <button onClick={() => setActiveTab("cart")} className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-4 rounded-full font-medium">
                  Go to Cart
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map(order => {
                  const isCancelled = order.status === "Cancelled" || order.status === "Refunded";
                  const stepIdx = isCancelled ? -1 : statusSteps.indexOf(order.status as any);
                  return (
                    <div key={order.id} className={`bg-white rounded-3xl shadow-sm border p-8 ${isCancelled ? "border-red-100" : "border-[var(--border)]"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">Placed on {order.date}</p>
                          {!isCancelled && <p className="text-xs text-[var(--text-secondary)]">Est. delivery: {order.estimatedDelivery}</p>}
                          {order.shippingAddress && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                              <MapPin size={11} />
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                            </p>
                          )}
                          {isCancelled && order.cancellationReason && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertTriangle size={12} /> Reason: {order.cancellationReason}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            {(order.discountAmount ?? 0) > 0 && (
                              <p className="text-sm text-green-600 font-medium">−${(order.discountAmount!).toFixed(2)} discount</p>
                            )}
                            {(order.taxAmount ?? 0) > 0 && (
                              <p className="text-xs text-[var(--text-secondary)]">+${(order.taxAmount!).toFixed(2)} tax</p>
                            )}
                            <p className="text-2xl font-bold text-[var(--primary)]">${order.total.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                              isCancelled ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                            }`}>{order.status}</span>
                            {order.paymentMethod && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                {order.paymentMethod === "cod" ? "COD" : "Card"}
                              </span>
                            )}
                          </div>
                          {canCancel(order.status) && (
                            <button onClick={() => openCancel(order.id)}
                              className="mt-1 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-full px-3 py-1.5 transition">
                              <XCircle size={13} /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {!isCancelled ? (
                        <div className="mb-8">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-[var(--border)]" />
                            <div className="absolute left-0 top-4 h-0.5 bg-[var(--primary)] transition-all" style={{ width: `${(stepIdx / (statusSteps.length - 1)) * 100}%` }} />
                            {statusSteps.map((step, i) => {
                              const Icon = statusIcons[step];
                              const active = i <= stepIdx;
                              return (
                                <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${active ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-white border-[var(--border)]"}`}>
                                    <Icon size={14} className={active ? "text-white" : "text-[var(--text-secondary)]"} />
                                  </div>
                                  <span className={`text-xs font-medium ${active ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                          <XCircle size={20} className="text-red-400 shrink-0" />
                          <div>
                            <p className="text-red-700 font-medium text-sm">This order has been {order.status.toLowerCase()}</p>
                            {order.cancellationReason && <p className="text-red-500 text-xs mt-0.5">Reason: {order.cancellationReason}</p>}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {order.items.map(item => (
                          // Key uses slug + tier to avoid duplicates
                          <div key={`${item.slug}__${item.tier}`} className="flex items-center gap-4 bg-[var(--background)] rounded-2xl p-3">
                            <Image src={item.image} alt={item.name} width={56} height={56} className="rounded-xl object-cover h-14 w-14" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{tierLabel[item.tier]} · {item.quantity} pack(s)</p>
                            </div>
                            <p className="font-semibold text-sm">${(item.pricePerPack * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
              <button onClick={() => setCancelModal({ orderId: "", open: false })} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Please let us know why you want to cancel order <span className="font-medium text-[var(--text-primary)]">#{cancelModal.orderId}</span>.</p>
            <div className="space-y-2 mb-6">
              {CANCEL_REASONS.map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${cancelReason === r ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/40"}`}>
                  <input type="radio" name="reason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-[var(--primary)]" />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
            {cancelError && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{cancelError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({ orderId: "", open: false })}
                className="flex-1 border border-[var(--border)] py-3 rounded-full text-sm font-medium hover:border-[var(--primary)] transition">
                Keep Order
              </button>
              <button onClick={handleCancelConfirm} disabled={cancelLoading}
                className="flex-1 bg-red-500 text-white py-3 rounded-full text-sm font-medium hover:bg-red-600 transition disabled:opacity-70">
                {cancelLoading ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-[var(--border)] rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 size={18} className="text-green-500" />
          {toast}
        </div>
      )}
    </section>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="pt-36 text-center"><div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] rounded-full mx-auto" /></div>}>
      <CartContent />
    </Suspense>
  );
}