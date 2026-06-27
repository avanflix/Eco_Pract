"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Plus, Check, CreditCard, Truck, Tag, Loader2,
  AlertCircle, ChevronRight, Home, Briefcase, MoreHorizontal,
  X, Navigation, CheckCircle2, ShieldCheck,
} from "lucide-react";
import { useCart } from "@/src/app/context/CartContext";

interface Address {
  _id?: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

interface PincodeInfo {
  deliverable: boolean;
  city?: string;
  state?: string;
  deliveryDays?: number;
  salesTaxRate?: number;
  message: string;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY", "DC",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoggedIn, userId, userEmail, userName, placeOrderFull } = useCart() as any;

  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address form
  const [form, setForm] = useState<Address>({
    label: "Home", fullName: userName || "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "US", phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Address>>({});
  const [savingAddress, setSavingAddress] = useState(false);

  // Pincode check
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Location permission
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // First order offer
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const subtotal = cart.reduce((s: number, i: any) => s + i.pricePerPack * i.quantity, 0);
  const discountAmount = couponResult?.discountAmount || 0;
  const afterDiscount = subtotal - discountAmount;
  const taxRate = pincodeInfo?.salesTaxRate || 0;
  const taxAmount = Math.round(afterDiscount * taxRate * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin?redirect=/checkout"); return; }
    if (cart.length === 0) { router.push("/cart"); return; }
    fetchAddresses();
    checkFirstOrder();
    requestLocationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  async function fetchAddresses() {
    if (!userId) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch(`/api/user/addresses?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
        const def = data.data.find((a: Address) => a.isDefault) || data.data[0];
        if (def) {
          setSelectedAddr(def);
          checkPincode(def.pincode);
        }
      }
    } catch { }
    setLoadingAddresses(false);
  }

  async function checkFirstOrder() {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && data.data.length === 0) setIsFirstOrder(true);
    } catch { }
  }

  function requestLocationPermission() {
    if (!navigator.geolocation) return;
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus("granted");
        // Reverse geocode using a free API
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const postcode = data.address?.postcode?.replace(/[^0-9]/g, "").substring(0, 5);
          if (postcode && !selectedAddr) {
            setForm(prev => ({ ...prev, pincode: postcode, city: data.address?.city || data.address?.town || "", state: data.address?.state_code || "" }));
            checkPincode(postcode);
          }
        } catch { }
      },
      () => setLocationStatus("denied")
    );
  }

  const checkPincode = useCallback(async (code: string) => {
    if (code.length !== 5) { setPincodeInfo(null); return; }
    setCheckingPincode(true);
    try {
      const res = await fetch(`/api/pincode?code=${code}`);
      const data = await res.json();
      setPincodeInfo({ deliverable: data.deliverable ?? false, ...data });
      if (data.salesTaxRate !== undefined) {
        // tax rate updated — re-render
      }
    } catch { setPincodeInfo(null); }
    setCheckingPincode(false);
  }, []);

  async function handleSaveAddress() {
    const errors: Partial<Address> = {};
    if (!form.fullName) errors.fullName = "Required";
    if (!form.line1) errors.line1 = "Required";
    if (!form.city) errors.city = "Required";
    if (!form.state) errors.state = "Required";
    if (!form.pincode || form.pincode.length !== 5) errors.pincode = "Enter valid 5-digit ZIP";
    if (!form.phone) errors.phone = "Required";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, address: { ...form, isDefault: addresses.length === 0 } }),
      });
      const data = await res.json();
      if (data.success) {
        const newAddr = { ...form, _id: String(data.data._id || Date.now()), isDefault: addresses.length === 0 };
        setAddresses(prev => [...prev, newAddr]);
        setSelectedAddr(newAddr);
        checkPincode(newAddr.pincode);
        setShowAddForm(false);
        setForm({ label: "Home", fullName: userName || "", line1: "", line2: "", city: "", state: "", pincode: "", country: "US", phone: "" });
      }
    } catch { }
    setSavingAddress(false);
  }

  async function handleApplyCoupon() {
    setCouponError(""); setCouponResult(null);
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), userEmail, subtotal }),
      });
      const data = await res.json();
      if (data.success) setCouponResult(data);
      else setCouponError(data.message);
    } catch { setCouponError("Failed to apply coupon."); }
    setCheckingCoupon(false);
  }

  async function handlePlaceOrder() {
    if (!selectedAddr) return;
    setOrderError(""); setPlacingOrder(true);
    try {
      await placeOrderFull({
        shippingAddress: selectedAddr,
        paymentMethod,
        subtotal,
        discountCode: couponResult?.code || null,
        discountAmount,
        taxRate,
        taxAmount,
        total,
      });
      router.push("/cart?tab=orders&success=1");
    } catch (e: any) {
      setOrderError(e.message || "Failed to place order. Please try again.");
    }
    setPlacingOrder(false);
  }

  const labelIcon = (label: string) => {
    if (label === "Home") return <Home size={14} />;
    if (label === "Work") return <Briefcase size={14} />;
    return <MoreHorizontal size={14} />;
  };

  if (!isLoggedIn || cart.length === 0) return null;

  return (
    <section className="pt-36 pb-24 min-h-screen bg-[var(--background)]">
      <div className="container-custom max-w-5xl">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-8">
          <Link href="/cart" className="hover:text-[var(--primary)]">Cart</Link>
          <ChevronRight size={14} />
          <span className="text-[var(--text-primary)] font-medium">Checkout</span>
        </div>

        <h1 className="text-4xl font-display mb-10">Checkout</h1>

        {/* Location permission banner */}
        {locationStatus === "requesting" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-blue-800">
            <Navigation size={16} className="shrink-0 animate-pulse" />
            Detecting your location to auto-fill address…
          </div>
        )}
        {locationStatus === "granted" && !selectedAddr && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-green-800">
            <CheckCircle2 size={16} className="shrink-0" />
            Location detected! ZIP code pre-filled below.
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          {/* Left: Address + Payment */}
          <div className="space-y-8">

            {/* Step 1 – Address */}
            <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">1</span>
                Delivery Address
              </h2>

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                </div>
              ) : (
                <>
                  {/* Saved addresses */}
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {addresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${selectedAddr?._id === addr._id
                              ? "border-[var(--primary)] bg-[var(--primary)]/5"
                              : "border-[var(--border)] hover:border-[var(--primary)]/40"
                            }`}
                          onClick={() => { setSelectedAddr(addr); checkPincode(addr.pincode); }}
                        >
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddr?._id === addr._id ? "border-[var(--primary)]" : "border-gray-300"
                            }`}>
                            {selectedAddr?._id === addr._id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                {labelIcon(addr.label)} {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-xs text-[var(--primary)] font-medium">Default</span>
                              )}
                            </div>
                            <p className="font-medium text-sm">{addr.fullName}</p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">{addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Pincode delivery check for selected address */}
                  {selectedAddr && (
                    <div className={`rounded-2xl p-4 mb-4 flex items-center gap-3 text-sm ${checkingPincode ? "bg-gray-50 border border-gray-200" :
                        pincodeInfo?.deliverable ? "bg-green-50 border border-green-200 text-green-800" :
                          pincodeInfo ? "bg-red-50 border border-red-200 text-red-800" : "hidden"
                      }`}>
                      {checkingPincode ? <Loader2 size={14} className="animate-spin" /> :
                        pincodeInfo?.deliverable ? <Check size={14} /> : <AlertCircle size={14} />}
                      <span>
                        {checkingPincode ? "Checking delivery availability…" : pincodeInfo?.message}
                        {pincodeInfo?.deliverable && pincodeInfo.salesTaxRate != null && (
                          <span className="ml-2 text-xs opacity-75">
                            (Sales tax: {(pincodeInfo.salesTaxRate * 100).toFixed(2)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Add new address */}
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] border-2 border-dashed border-[var(--primary)]/30 hover:border-[var(--primary)] rounded-2xl px-5 py-3 w-full justify-center transition"
                    >
                      <Plus size={16} /> Add New Address
                    </button>
                  ) : (
                    <div className="border border-[var(--border)] rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">New Address</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                      </div>

                      {/* Label selector */}
                      <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">Address Label</p>
                        <div className="flex gap-2">
                          {["Home", "Work", "Other"].map(l => (
                            <button key={l}
                              onClick={() => setForm(prev => ({ ...prev, label: l }))}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs border transition ${form.label === l ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-gray-200 hover:border-[var(--primary)]"
                                }`}
                            >
                              {labelIcon(l)} {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Full Name *</label>
                          <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                            placeholder="Jane Smith"
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.fullName ? "border-red-400" : "border-gray-200"}`} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Phone *</label>
                          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="(555) 000-0000"
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.phone ? "border-red-400" : "border-gray-200"}`} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Address Line 1 *</label>
                        <input value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                          placeholder="123 Main St"
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.line1 ? "border-red-400" : "border-gray-200"}`} />
                      </div>

                      <div>
                        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Address Line 2 (optional)</label>
                        <input value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))}
                          placeholder="Apt, Suite, etc."
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]" />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[var(--text-secondary)] mb-1 block">City *</label>
                          <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                            placeholder="New York"
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.city ? "border-red-400" : "border-gray-200"}`} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-secondary)] mb-1 block">State *</label>
                          <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.state ? "border-red-400" : "border-gray-200"}`}>
                            <option value="">State</option>
                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-secondary)] mb-1 block">ZIP Code *</label>
                          <input value={form.pincode}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, "").substring(0, 5);
                              setForm(p => ({ ...p, pincode: v }));
                              if (v.length === 5) checkPincode(v);
                              else setPincodeInfo(null);
                            }}
                            placeholder="10001"
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] ${formErrors.pincode ? "border-red-400" : "border-gray-200"}`} />
                          {checkingPincode && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Checking…</p>}
                          {pincodeInfo && !checkingPincode && (
                            <p className={`text-xs mt-1 ${pincodeInfo.deliverable ? "text-green-600" : "text-red-500"}`}>
                              {pincodeInfo.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="w-full bg-[var(--primary)] text-white py-3 rounded-full font-medium text-sm hover:bg-[var(--primary-light)] transition disabled:opacity-60"
                      >
                        {savingAddress ? "Saving…" : "Save Address"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step 2 – Payment */}
            <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">2</span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Stripe */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${paymentMethod === "stripe" ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/40"
                    }`}
                  onClick={() => setPaymentMethod("stripe")}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "stripe" ? "border-[var(--primary)]" : "border-gray-300"
                    }`}>
                    {paymentMethod === "stripe" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                  </div>
                  <CreditCard size={20} className="text-[var(--primary)]" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-[var(--text-secondary)]">Visa, Mastercard, AMEX, Discover — powered by Stripe</p>
                  </div>
                  <div className="flex gap-1">
                    {["💳"].map(c => <span key={c} className="text-lg">{c}</span>)}
                  </div>
                </label>

                {/* COD */}
                {/* <label 
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "cod" ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/40"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "cod" ? "border-[var(--primary)]" : "border-gray-300"
                  }`}>
                    {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                  </div>
                  <Truck size={20} className="text-[var(--primary)]" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-[var(--text-secondary)]">Pay when you receive your order</p>
                  </div>
                  <div className="flex gap-1">
                    {["💵"].map(c => <span key={c} className="text-lg">{c}</span>)}
                  </div>
                </label> */}
                <label
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  </div>

                  <Truck size={20} className="text-gray-400" />

                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-500">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-gray-400">
                      Currently unavailable
                    </p>
                  </div>

                  <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-red-100 text-red-600">
                    Disabled
                  </span>
                </label>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <ShieldCheck size={14} className="text-green-600" />
                Your payment info is secured with 256-bit SSL encryption
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            {/* First order banner */}
            {isFirstOrder && !couponResult && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-semibold text-amber-800 text-sm mb-1">🎉 First Order Offer!</p>
                <p className="text-xs text-amber-700 mb-2">Use code <span className="font-mono font-bold">WELCOME10</span> for 10% off your first order.</p>
                <button
                  onClick={() => { setCouponCode("WELCOME10"); }}
                  className="text-xs font-medium text-amber-800 underline"
                >
                  Apply automatically →
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-6 sticky top-32">
              <h2 className="text-lg font-semibold mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                {cart.map((item: any) => (
                  <div key={item.slug} className="flex items-center gap-3">
                    <Image src={item.image} alt={item.name} width={44} height={44} className="rounded-xl object-cover w-11 h-11 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{item.quantity} × ${item.pricePerPack}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">${(item.pricePerPack * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <hr className="border-[var(--border)] mb-4" />

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={checkingCoupon || !couponCode}
                    className="flex items-center gap-1 bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {checkingCoupon ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                {couponResult && (
                  <div className="flex items-center gap-2 mt-1.5 text-green-700 text-xs">
                    <Check size={12} /> {couponResult.message}
                    <button onClick={() => { setCouponResult(null); setCouponCode(""); }} className="ml-auto text-gray-400 hover:text-gray-600">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({couponResult?.code})</span>
                    <span>−${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Sales Tax ({(taxRate * 100).toFixed(2)}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-[var(--border)]" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery info */}
              {pincodeInfo?.deliverable && pincodeInfo.deliveryDays && (
                <div className="mt-4 bg-green-50 rounded-2xl p-3 text-xs text-green-800 flex items-center gap-2">
                  <Truck size={13} /> Estimated delivery in {pincodeInfo.deliveryDays} business days
                </div>
              )}

              {orderError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {orderError}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  !selectedAddr ||
                  pincodeInfo?.deliverable === false
                }
                className="w-full mt-5 bg-[var(--primary)] text-white py-4 rounded-full font-semibold hover:bg-[var(--primary-light)] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placingOrder ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : `Continue to Payment - $${total.toFixed(2)}`}
              </button>

              {!selectedAddr && (
                <p className="text-xs text-center text-[var(--text-secondary)] mt-2">Please add a delivery address to continue.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
