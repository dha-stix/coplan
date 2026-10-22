const TEAMS = ["Product", "Design", "Engineering", "Marketing", "Agencies", "Classrooms"];

export function BuiltFor() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-9 gap-y-3 px-4 py-7 sm:px-5">
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Built for teams in</span>
        {TEAMS.map((t) => (
          <span key={t} className="font-display text-xl font-semibold text-ink-2 sm:text-[22px]">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
