"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle, MessageCircle, Loader2 } from "lucide-react";

const contacts = [
  { icon: Phone, label: "Phone", value: "+91 7036777677", href: "tel:+917036777677" },
  { icon: Mail, label: "Email", value: "info@ecopract.co.in", href: "mailto:info@ecopract.co.in" },
  {
    icon: MapPin,
    label: "Address",
    value: "Villa No. 178, Chitrapuri Colony, Manikonda, Hyderabad 500104",
    href: "https://www.google.com/maps?q=Chitrapuri+Colony+Manikonda+Hyderabad",
  },
  { icon: Clock, label: "Hours", value: "Mon–Sat   9 AM – 7 PM IST", href: "#" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pt-28">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#F2EDE4] to-[var(--background)] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="text-[var(--primary)] uppercase tracking-widest text-sm font-medium block mb-4">
            Get in Touch
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-semibold text-[var(--text-primary)]">
            We'd love to <em className="italic text-[var(--primary)]">hear</em> from you
          </h1>
          <p className="mt-6 text-[var(--text-secondary)] text-lg max-w-xl">
            Whether you have a bulk order inquiry, need help, or just want to share the love
            we're always available.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-display text-2xl text-[var(--text-primary)] font-semibold">
              Contact Information
            </h2>
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 group"
                target={href.startsWith("http") ? "_blank" : undefined}
              >
                <div className="w-11 h-11 bg-[#E8F0E2] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)] transition">
                  <Icon className="w-5 h-5 text-[var(--primary)] group-hover:text-white transition" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1">
                    {label}
                  </div>
                  <div className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)] transition">
                    {value}
                  </div>
                </div>
              </a>
            ))}

            <div className="mt-8 bg-[var(--primary)] rounded-3xl p-6 text-white">
              <MessageCircle size={22} className="mb-3 text-white/70" />
              <p className="font-display text-xl font-semibold">Bulk Orders?</p>
              <p className="text-white/75 text-sm mt-2 leading-relaxed">
                For orders above 1,000 units, we offer special pricing. Reach out and
                we'll create a custom quote within 24 hours.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-[#E8F0E2] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h3 className="font-display text-3xl text-[var(--text-primary)] mb-3">
                  Message Sent!
                </h3>
                <p className="text-[var(--text-secondary)]">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setForm({ name: "", email: "", subject: "", message: "" });
                    setSubmitted(false);
                  }}
                  className="mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-full text-sm font-medium"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 border border-[var(--border)] space-y-5"
              >
                <h3 className="font-display text-2xl text-[var(--text-primary)] font-semibold mb-2">
                  Send a Message
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  {["name", "email"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 capitalize">
                        {field}
                      </label>
                      <input
                        required
                        type={field === "email" ? "email" : "text"}
                        value={form[field as keyof typeof form]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [field]: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Bulk order inquiry, Product question..."
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-[var(--primary)] text-white rounded-full font-medium hover:bg-[var(--primary-light)] transition flex items-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
