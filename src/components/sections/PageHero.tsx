interface Props {
  title: string;
  subtitle: string;
}

export default function PageHero({
  title,
  subtitle,
}: Props) {
  return (
    <section className="pt-40 pb-24">
      <div className="container-custom text-center">
        <h1 className="text-5xl lg:text-7xl font-display font-semibold">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}