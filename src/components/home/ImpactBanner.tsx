import { Heart, Globe, Leaf } from "lucide-react";

export default function ImpactBanner() {
  return (
    <section className="bg-[var(--primary)] text-white py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Heart, title: "Women-Led Craftsmanship", desc: "Every plate is handcrafted by women from rural India, providing sustainable livelihoods and economic empowerment." },
            { icon: Globe, title: "USA-Wide Delivery", desc: "From the villages of India to your table in America — we bridge continents through conscious commerce." },
            { icon: Leaf, title: "Zero Plastic Promise", desc: "100% compostable, no coatings, no chemicals. Returns to earth in 60 days." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="text-white/75 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
