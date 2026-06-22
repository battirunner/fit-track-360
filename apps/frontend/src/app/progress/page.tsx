import { CalendarCheck, Dumbbell, Droplets, TrendingDown } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/modules/metric-card";
import { WeightChart } from "@/components/modules/weight-chart";
import { getDashboardSummary, getMonthlyDashboard } from "@/lib/api";

export default async function ProgressPage() {
  const [summary, monthly] = await Promise.all([getDashboardSummary(), getMonthlyDashboard()]);

  return (
    <AppShell eyebrow="Analytics" title="Progress analytics">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="Completed meal logs"
            icon={<CalendarCheck size={20} />}
            label="Meal logs"
            value={`${monthly.meal_compliance}`}
          />
          <MetricCard
            detail="Sessions this month"
            icon={<Dumbbell size={20} />}
            label="Gym attendance"
            value={`${monthly.gym_attendance}`}
          />
          <MetricCard
            detail="Average logged amount"
            icon={<Droplets size={20} />}
            label="Water average"
            value={`${monthly.water_average_ml} ml`}
          />
          <MetricCard
            detail="Current month"
            icon={<TrendingDown size={20} />}
            label="Weight change"
            value={`${monthly.weight_change_kg} kg`}
          />
        </section>
        <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Weight trend</h2>
          <WeightChart data={summary.weight_trend} />
        </section>
      </div>
    </AppShell>
  );
}
