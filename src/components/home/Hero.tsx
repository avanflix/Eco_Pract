"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Recycle, Heart } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] px-4 py-2 rounded-full shadow-sm mb-2">
              <Leaf size={16} className="text-[var(--primary)]" />
              <span className="text-sm font-medium">Sustainable Dining Solutions</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-full shadow-sm ml-2 mb-2">
              <Heart size={14} className="text-rose-500 fill-rose-400" />
              <span className="text-sm font-medium text-rose-700">Empowering Women in India</span>
            </div>

            <h1 className="mt-6 text-5xl md:text-6xl lg:text-5xl leading-[1.05] font-display font-semibold">
              Eco-Friendly
              <span className="block text-[var(--primary)]">Dining For</span>
              Modern Living
            </h1>

            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Premium biodegradable areca leaf plates and bowls — handcrafted by skilled women artisans in rural India, 
              shipped across the USA. Every purchase empowers a family.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#products" className="bg-[var(--primary)] text-white px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition">
                Shop Products <ArrowRight size={18} />
              </a>
              <Link href="/about" className="bg-white border border-[var(--border)] px-8 py-4 rounded-full hover:bg-gray-50 transition">
                Our Story
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-14">
              {[
                { value: "50K+", label: "Products Sold" },
                { value: "200+", label: "Women Employed" },
                { value: "100%", label: "Biodegradable" },
              ].map(s => (
                <div key={s.label}>
                  <h3 className="text-3xl font-bold text-[var(--primary)]">{s.value}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-20 z-20 hidden lg:block">
              <div className="bg-white rounded-3xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <Recycle size={22} className="text-green-600" />
                  <div>
                    <p className="font-semibold text-sm">Eco Impact</p>
                    <p className="text-xs text-gray-500">100% Compostable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-[40px] overflow-hidden card-shadow">
              <Image
                src="/images/hero/eco GP.png"
                alt="EcoPract Sustainable Dining"
                width={1200}
                height={900}
                priority
                className="w-full h-[650px] object-cover"
              />
            </div>

            <div className="absolute bottom-8 right-8 bg-white rounded-3xl p-4 shadow-xl">
              <p className="text-sm font-medium text-gray-600">Plastics Saved</p>
              <p className="text-2xl font-bold text-[var(--primary)] mt-1">50,000+</p>
              <p className="text-xs text-gray-500">Single-use plastics avoided</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
