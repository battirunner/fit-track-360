import { AppShell } from "@/components/layout/app-shell";
import { WeightChart } from "@/components/modules/weight-chart";
import { WeightEntry } from "@/components/modules/weight-entry";
import { getDashboardSummary, getWeightLogs } from "@/lib/api";

export default async function WeightPage() {
  const [summary, weights] = await Promise.all([getDashboardSummary(), getWeightLogs()]);

  return (
    <AppShell eyebrow="Body metrics" title="Weight tracker">
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <WeightEntry latestWeight={summary.latest_weight_kg} />
        <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Weight trend</h2>
          <WeightChart data={weights} />
        </section>
      </div>
    </AppShell>
  );
}
