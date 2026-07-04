"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Leaf, Recycle, Heart } from "lucide-react";

function Counter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen lg:h-screen flex items-center pt-15 lg:pt-16 pb-10 lg:pb-0">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-60 h-60 bg-green-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container-custom max-w-6xl mx-auto px-5 lg:px-8">
        <div className="lg:scale-[0.95] origin-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] px-3 py-1.5 rounded-full shadow-sm">
                  <Leaf size={14} className="text-[var(--primary)]" />
                  <span className="text-xs lg:text-sm font-medium">
                    Sustainable Dining Solutions
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full shadow-sm">
                  <Heart
                    size={12}
                    className="text-rose-500 fill-rose-400"
                  />
                  <span className="text-xs lg:text-sm font-medium text-rose-700">
                    Empowering Women in India
                  </span>
                </div>
              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.7rem] xl:text-[3rem] leading-[1.1] font-display font-semibold">
                Eco-Friendly
                <span className="block text-[var(--primary)]">
                  Dining For
                </span>
                Modern Living
              </h1>

              <p className="mt-3 text-sm lg:text-base text-[var(--text-secondary)] max-w-lg leading-7">
                Premium biodegradable Sal & Palash leaf plates and bowls handcrafted
                by skilled women artisans in rural India, shipped across the
                USA. Every purchase empowers a family.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="bg-[var(--primary)] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition text-sm font-medium"
                >
                  Shop Products
                  <ArrowRight size={16} />
                </a>

                <Link
                  href="/about"
                  className="bg-white border border-[var(--border)] px-6 py-3 rounded-full hover:bg-gray-50 transition text-sm font-medium"
                >
                  Our Story
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { value: 50000, suffix: "+", label: "Products Sold" },
                  { value: 200, suffix: "+", label: "Women Employed" },
                  { value: 100, suffix: "%", label: "Biodegradable" },
                ].map((s) => (
                  <div key={s.label}>
                    <h3 className="text-xl lg:text-2xl font-bold text-[var(--primary)]">
                      <Counter end={s.value} suffix={s.suffix} />
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content */}
            <div className="relative">
              {/* Floating Card */}
              <div className="absolute -left-12 top-12 z-20 hidden lg:block">
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Recycle size={18} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-xs">Eco Impact</p>
                      <p className="text-[11px] text-gray-500">
                        100% Compostable
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-[32px] overflow-hidden card-shadow">
                <Image
                  src="/images/hero/eco GP.png"
                  alt="EcoPract Sustainable Dining"
                  width={1200}
                  height={900}
                  priority
                  className="w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[360px] xl:h-[380px] object-cover"
                />
              </div>

              {/* Bottom Card */}
              <div className="absolute bottom-3 right-3 hidden lg:block bg-white rounded-2xl p-3 shadow-xl">
                <p className="text-xs font-medium text-gray-600">
                  Environmental Impact
                </p>
                <p className="text-xl font-bold text-[var(--primary)] mt-1">
                  50,000+
                </p>
                <p className="text-[11px] text-gray-500">
                  Single-use plastics avoided
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}