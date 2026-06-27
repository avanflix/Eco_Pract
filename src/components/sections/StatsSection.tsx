const stats = [
  { value: "50K+", label: "Products Sold" },
  { value: "500+", label: "Business Clients" },
  { value: "100%", label: "Biodegradable" },
  { value: "20+", label: "Cities Served" },
];

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[32px] bg-white p-8 text-center shadow-md"
            >
              <h3 className="text-4xl font-bold text-[var(--primary)]">
                {item.value}
              </h3>

              <p className="mt-2 text-[var(--text-secondary)]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}