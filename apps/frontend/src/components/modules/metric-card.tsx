import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-steel">{label}</p>
        <div className="grid size-9 place-items-center rounded-md bg-white/70 text-ink">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{detail}</p>
    </article>
  );
}
