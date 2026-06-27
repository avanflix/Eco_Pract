interface Props {
  badge?: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  badge,
  title,
  description,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {badge && (
        <span className="inline-flex rounded-full border px-4 py-2 text-sm">
          {badge}
        </span>
      )}

      <h2 className="mt-5 text-4xl md:text-5xl font-display font-semibold">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-[var(--text-secondary)]">
          {description}
        </p>
      )}
    </div>
  );
}