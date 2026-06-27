"use client";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { User, MapPin, Lock, CheckCircle2, AlertCircle, Loader2, Edit2, Save, X } from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
};

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

export default function ProfilePage() {
  const { isLoggedIn, userId, userName, userEmail, logout } = useCart();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData>({
    name: userName,
    email: userEmail,
    phone: "",
    address: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
  });
  const [editSection, setEditSection] = useState<"personal" | "address" | "password" | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Password state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    if (userId) {
      fetch(`/api/user?id=${userId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const u = data.data;
            setProfile({
              name: u.name,
              email: u.email,
              phone: u.phone || "",
              address: {
                line1: u.address?.line1 || "",
                line2: u.address?.line2 || "",
                city: u.address?.city || "",
                state: u.address?.state || "",
                pincode: u.address?.pincode || "",
                country: u.address?.country || "India",
              },
            });
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, userId, router]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const savePersonal = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name: profile.name, phone: profile.phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("Profile updated successfully!", "success");
      setEditSection(null);
    } catch (e: any) {
      showToast(e.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, address: profile.address }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("Address saved successfully!", "success");
      setEditSection(null);
    } catch (e: any) {
      showToast(e.message || "Failed to save address.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      showToast("New passwords do not match.", "error"); return;
    }
    if (passwords.newPass.length < 6) {
      showToast("Password must be at least 6 characters.", "error"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("Password changed successfully!", "success");
      setPasswords({ current: "", newPass: "", confirm: "" });
      setEditSection(null);
    } catch (e: any) {
      showToast(e.message || "Failed to change password.", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] transition text-sm";
  const labelCls = "block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide";

  return (
    <section className="pt-36 pb-24 min-h-screen">
      <div className="container-custom max-w-3xl">
        <h1 className="text-5xl font-display mb-2">My Profile</h1>
        <p className="text-[var(--text-secondary)] mb-10">Manage your personal details and address</p>

        {/* Personal Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <User size={18} className="text-[var(--primary)]" />
              </div>
              <h2 className="font-display text-xl font-semibold">Personal Information</h2>
            </div>
            {editSection !== "personal" ? (
              <button onClick={() => setEditSection("personal")} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
                <Edit2 size={15} /> Edit
              </button>
            ) : (
              <button onClick={() => setEditSection(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            )}
          </div>

          {editSection !== "personal" ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className={labelCls}>Full Name</p>
                <p className="font-medium">{profile.name || "—"}</p>
              </div>
              <div>
                <p className={labelCls}>Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className={labelCls}>Phone</p>
                <p className="font-medium">{profile.phone || "Not added"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} value={profile.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} placeholder="+91 98765 43210" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditSection(null)} className="px-5 py-2.5 border border-[var(--border)] rounded-full text-sm hover:border-[var(--primary)] transition">Cancel</button>
                <button onClick={savePersonal} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-full text-sm hover:bg-[var(--primary-light)] transition disabled:opacity-70">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <MapPin size={18} className="text-[var(--primary)]" />
              </div>
              <h2 className="font-display text-xl font-semibold">Delivery Address</h2>
            </div>
            {editSection !== "address" ? (
              <button onClick={() => setEditSection("address")} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
                <Edit2 size={15} /> {profile.address.line1 ? "Edit" : "Add Address"}
              </button>
            ) : (
              <button onClick={() => setEditSection(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            )}
          </div>

          {editSection !== "address" ? (
            profile.address.line1 ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{profile.address.line1}</p>
                {profile.address.line2 && <p className="text-[var(--text-secondary)]">{profile.address.line2}</p>}
                <p className="text-[var(--text-secondary)]">{[profile.address.city, profile.address.state, profile.address.pincode].filter(Boolean).join(", ")}</p>
                <p className="text-[var(--text-secondary)]">{profile.address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No address added yet.</p>
            )
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Address Line 1</label>
                <input className={inputCls} placeholder="House / Flat / Building" value={profile.address.line1} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, line1: e.target.value } }))} />
              </div>
              <div>
                <label className={labelCls}>Address Line 2</label>
                <input className={inputCls} placeholder="Street / Area (optional)" value={profile.address.line2} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, line2: e.target.value } }))} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} placeholder="City" value={profile.address.city} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select className={inputCls} value={profile.address.state} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, state: e.target.value } }))}>
                    <option value="">Select State</option>
                    {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input className={inputCls} placeholder="560001" value={profile.address.pincode} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <select className={inputCls} value={profile.address.country} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, country: e.target.value } }))}>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditSection(null)} className="px-5 py-2.5 border border-[var(--border)] rounded-full text-sm hover:border-[var(--primary)] transition">Cancel</button>
                <button onClick={saveAddress} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-full text-sm hover:bg-[var(--primary-light)] transition disabled:opacity-70">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <Lock size={18} className="text-[var(--primary)]" />
              </div>
              <h2 className="font-display text-xl font-semibold">Change Password</h2>
            </div>
            {editSection !== "password" ? (
              <button onClick={() => setEditSection("password")} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
                <Edit2 size={15} /> Change
              </button>
            ) : (
              <button onClick={() => setEditSection(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            )}
          </div>

          {editSection === "password" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <input type="password" className={inputCls} value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" className={inputCls} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" className={inputCls} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditSection(null)} className="px-5 py-2.5 border border-[var(--border)] rounded-full text-sm hover:border-[var(--primary)] transition">Cancel</button>
                <button onClick={changePassword} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-full text-sm hover:bg-[var(--primary-light)] transition disabled:opacity-70">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Update Password
                </button>
              </div>
            </div>
          )}
          {editSection !== "password" && (
            <p className="text-sm text-[var(--text-secondary)]">Keep your account secure with a strong password.</p>
          )}
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Sign out of your account</p>
            <p className="text-xs text-[var(--text-secondary)]">You will be redirected to the homepage</p>
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="px-6 py-3 text-sm text-red-500 border border-red-200 rounded-full hover:bg-red-50 hover:border-red-400 transition font-medium">
            Sign Out
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 text-sm font-medium border ${
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
          {toast.msg}
        </div>
      )}
    </section>
  );
}
