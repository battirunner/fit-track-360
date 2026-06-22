import { GlassWater, Scale, ShieldCheck, Utensils } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { GymPanel } from "@/components/modules/gym-panel";
import { MealList } from "@/components/modules/meal-list";
import { MetricCard } from "@/components/modules/metric-card";
import { NotificationPanel } from "@/components/modules/notification-panel";
import { WeightChart } from "@/components/modules/weight-chart";
import { getDashboardSummary, getTodayMeals } from "@/lib/api";

export default async function DashboardPage() {
  const [summary, meals] = await Promise.all([getDashboardSummary(), getTodayMeals()]);
  const waterPercent = Math.min(100, Math.round((summary.water_ml / summary.water_goal_ml) * 100));

  return (
    <AppShell eyebrow="Today" title="Your dashboard">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail={`${Math.round((summary.meals_completed / summary.meals_total) * 100)}% complete today`}
            icon={<Utensils size={20} />}
            label="Meal compliance"
            value={`${summary.meals_completed}/${summary.meals_total}`}
          />
          <MetricCard
            detail="Goal: 72 kg"
            icon={<Scale size={20} />}
            label="Latest weight"
            value={`${summary.latest_weight_kg} kg`}
          />
          <MetricCard
            detail={`${waterPercent}% of ${summary.water_goal_ml} ml`}
            icon={<GlassWater size={20} />}
            label="Water intake"
            value={`${summary.water_ml} ml`}
          />
          <MetricCard
            detail="Meals, gym, water, weight"
            icon={<ShieldCheck size={20} />}
            label="Monthly score"
            value={`${summary.monthly_score}`}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <MealList meals={meals} />
          <div className="grid gap-5">
            <GymPanel initialStatus={summary.gym_status} />
            <NotificationPanel />
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Weight progress</h2>
            <p className="text-sm text-ink/65">Recent trend from weight logs</p>
          </div>
          <WeightChart data={summary.weight_trend} />
        </section>
      </div>
    </AppShell>
  );
}
