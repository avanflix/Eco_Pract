import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-3 md:grid-cols-3 gap-12">
          <div>
            <h2 className="font-display text-4xl font-semibold">EcoPract</h2>
            <p className="mt-6 text-gray-400 leading-relaxed text-sm">
              Premium biodegradable areca leaf plates, handcrafted by women artisans in India. 
              Delivered across the USA. Every purchase supports a family.
            </p>
            <div className="flex gap-4 mt-8">
              {[FaFacebookF, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--primary)] transition">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Pages</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {[["Home", "/"], ["About Us", "/about"], ["Contact", "/contact"], ["Cart", "/cart"], ["Sign In", "/signin"]].map(([name, href]) => (
                <li key={name}>
                  <Link href={href} className="hover:text-white transition">{name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-5 text-gray-400 text-sm">
              <div className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <a href="tel:+917036777677" className="hover:text-white transition">+91 7036777677</a>
              </div>
              <div className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href="mailto:info@ecopract.co.in" className="hover:text-white transition">info@ecopract.co.in</a>
              </div>
              <div className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} EcoPract. All Rights Reserved.</p>
          <p className="text-gray-600 text-xs">Handcrafted in India · Loved in America 🌿</p>
        </div>
      </div>
    </footer>
  );
}
