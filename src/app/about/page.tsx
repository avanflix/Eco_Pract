import Image from "next/image";
import { Heart, Leaf, Globe, Award, Users, Sprout } from "lucide-react";

const journey = [
  { id: 1, year: "2024", title: "The Seed of an Idea", desc: "Our founder, passionate about zero-waste living, discovered areca palm leaves as a natural alternative to plastic in rural Andhra Pradesh." },
  { id: 2, year: "2024", title: "First Women's Collective", desc: "We partnered with 12 women in a small village near Hyderabad, training them in traditional leaf-plate crafting techniques passed down for generations." },
  { id: 3, year: "2025", title: "Growing the Family", desc: "Over 80 women were employed across 5 villages. Each artisan earns a fair wage, creating real financial independence for their families." },
  { id: 4, year: "2025", title: "Reaching America", desc: "Our first shipment to the USA. American families and restaurants discovered that going green can also mean beautiful, functional dining." },
  { id: 5, year: "2025", title: "200+ Women, One Mission", desc: "Today, more than 200 women artisans across Telangana and Andhra Pradesh craft every plate by hand, with pride and purpose." },
  { id: 6, year: "Now", title: "Every Order Changes a Life", desc: "When you buy from EcoPract, you're not just going eco — you're sending a meal to a child, school fees for a daughter, hope to a family." },
];

const stats = [
  { icon: Users, value: "200+", label: "Women Employed" },
  { icon: Globe, value: "5", label: "Villages Reached" },
  { icon: Leaf, value: "50K+", label: "Plates Sold in USA" },
  { icon: Award, value: "100%", label: "Fair Wage Committed" },
];

const womenStories = [
  {
    name: "Sunitha",
    role: "Quality Checker, 2 years",
    quote:
      "Maa amma, ammamma nerpinchina pani ki ippudu manchi viluva vachindi. EcoPract valla maa oorilo chaala mandhi aadavallaki upadhi dorikindi. Maa kutumbam kosam memu garvanga pani chestunnam.",
    region: "Eluru, Andhra Pradesh",
  },
  {
    name: "Lakshmi",
    role: "Master Artisan, 1+ years",
    quote:
      "ఈ పని వల్ల మా ఇంటికి మంచి ఆధారం దొరికింది. మా పిల్లల్ని బాగా చదివిస్తున్నాం. మా చేతులతో చేసిన ప్లేట్లు అమెరికా వరకు వెళుతున్నాయంటే చాలా సంతోషంగా ఉంటుంది.",
    region: "West Godavari, Andhra Pradesh",
  },
  {
    name: "Padma",
    role: "Team Leader, 2 years",
    quote:
      "Mundhu intlo ne undedanni. Ippudu naa sampadanatho inti kharchullo nenu kuda sahayam chesthunna. Maa laanti mahilalaki ee pani chaala pedda andaga undi.",
    region: "Rajamundry, Andhra Pradesh",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-20 bg-gradient-to-b from-[#F2EDE4] to-[var(--background)]">
        <div className="container-custom max-w-5xl text-center">
          <span className="text-[var(--primary)] uppercase tracking-widest text-sm font-medium">Our Story</span>
          <h1 className="mt-4 font-display text-5xl lg:text-7xl font-semibold leading-tight">
            Plates Made with <span className="text-[var(--primary)]">Purpose</span>
          </h1>
          <p className="mt-8 text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            EcoPract began with a simple belief: that what we eat from should not cost the earth.
            But it grew into something far more powerful — a movement that empowers women, preserves tradition,
            and brings sustainable beauty to American tables.
          </p>
        </div>
      </section>

      {/* Emotional Mission */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Heart size={20} className="text-rose-500 fill-rose-400" />
                <span className="text-rose-600 font-medium uppercase text-sm tracking-wider">The Human Behind Every Plate</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">
                Behind every plate is a woman who deserves to be seen
              </h2>
              <p className="mt-6 text-[var(--text-secondary)] leading-relaxed">
                In the villages of Telangana and Andhra Pradesh, women have used areca palm leaves
                for centuries. But without markets, their craft went unrecognized and unpaid.
              </p>
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                EcoPract changed that. We built a supply chain that puts these women first — fair wages,
                safe working conditions, and the dignity of being a skilled artisan whose work reaches
                homes across the United States.
              </p>
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                When you set a table with our plates, you're telling the story of Lakshmi who
                now pays her daughter's school fees, of Padma who opened a savings account for
                the first time, of Sunitha who leads a team of 15 women with confidence and pride.
              </p>
            </div>
            <div className="relative rounded-[40px] overflow-hidden h-[500px] card-shadow">
              <Image
                src="/images/categories/plates.jpg"
                alt="Women artisans crafting areca leaf plates"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                <p className="text-white font-display text-xl">"Each plate carries our hands, our hearts, and our hope."</p>
                <p className="text-white/70 text-sm mt-1">— Lakshmi Devi, Master Artisan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[var(--primary)]">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon size={28} className="mx-auto mb-3 text-white/70" />
                <p className="text-4xl font-bold font-display">{value}</p>
                <p className="text-white/70 mt-2 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="section-padding bg-[var(--background)]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-[var(--primary)] uppercase tracking-widest text-sm font-medium">Our Journey</span>
            <h2 className="mt-4 font-display text-4xl font-semibold">From a Village to Your Table</h2>
          </div>
          <div className="relative max-w-6xl mx-auto">

            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)] -translate-x-1/2" />

            <div className="space-y-16">
              {journey.map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative flex items-center ${idx % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                >
                  {/* Card */}
                  <div className="w-full lg:w-[45%]">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--border)] hover:shadow-lg transition-all duration-300">
                      <span className="text-[var(--primary)] font-bold text-sm">
                        {item.year}
                      </span>

                      <h3 className="font-display text-2xl font-semibold mt-2">
                        {item.title}
                      </h3>

                      <p className="text-[var(--text-secondary)] mt-3 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--primary)] border-4 border-[var(--background)] z-10" />
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* Women Stories */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart size={20} className="text-rose-500 fill-rose-400" />
              <span className="text-rose-600 font-medium uppercase text-sm tracking-wider">Real People, Real Impact</span>
            </div>
            <h2 className="font-display text-4xl font-semibold">Voices from Our Artisans</h2>
            <p className="text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto">
              These are not just employees. They are the heart and hands of EcoPract.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {womenStories.map(story => (
              <div key={story.name} className="bg-[var(--background)] rounded-3xl p-8 border border-[var(--border)]">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mb-6">
                  <span className="text-white text-2xl font-display font-bold">{story.name[0]}</span>
                </div>
                <blockquote className="text-[var(--text-secondary)] italic leading-relaxed mb-6">
                  "{story.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{story.name}</p>
                  <p className="text-sm text-[var(--primary)]">{story.role}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{story.region}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Image Section */}
      <section className="section-padding bg-[var(--background)]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-[40px] overflow-hidden h-[400px] card-shadow">
              <Image
                src="/images/categories/cups.jpg"
                alt="Areca leaf bowls and cups"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Sprout size={32} className="text-[var(--primary)] mb-6" />
              <h2 className="font-display text-4xl font-semibold">Why Areca Leaf?</h2>
              <p className="mt-6 text-[var(--text-secondary)] leading-relaxed">
                Areca palm leaves fall naturally — no trees are cut, no forests harmed.
                After serving your meal beautifully, each plate decomposes within 60 days,
                returning nutrients to the soil with zero chemical residue.
              </p>
              <ul className="mt-6 space-y-3">
                {["No plastic coating, no glue, no chemicals", "Naturally water and heat resistant", "Compostable in home or industrial settings", "Sturdy enough for wet curries and heavy meals", "USDA BioPreferred certified materials"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
