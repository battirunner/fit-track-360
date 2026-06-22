import { AppShell } from "@/components/layout/app-shell";
import { GymPanel } from "@/components/modules/gym-panel";
import { getDashboardSummary } from "@/lib/api";

export default async function GymPage() {
  const summary = await getDashboardSummary();

  return (
    <AppShell eyebrow="Training" title="Gym tracker">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <GymPanel initialStatus={summary.gym_status} />
        <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold">Session history</h2>
          <p className="mt-1 text-sm text-ink/65">Workout history endpoint is next in the API queue.</p>
          <div className="mt-4 rounded-lg border border-ink/10 bg-white/60 p-4">
            <p className="font-semibold capitalize">{summary.gym_status.replaceAll("_", " ")}</p>
            <p className="text-sm text-ink/65">Current session state from today&apos;s dashboard summary.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
