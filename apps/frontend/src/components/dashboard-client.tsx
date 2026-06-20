"use client";

import type { DashboardSummary, Meal } from "@fittrack/shared-types";
import { Check, Dumbbell, GlassWater, Plus, Scale, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Props = {
  summary: DashboardSummary;
  meals: Meal[];
};

export function DashboardClient({ summary, meals }: Props) {
  const [localMeals, setLocalMeals] = useState(meals);
  const [gymStatus, setGymStatus] = useState(summary.gym_status);
  const [notifications, setNotifications] = useState<NotificationPermission | "unsupported">(
    "unsupported"
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if ("Notification" in window) {
      setNotifications(Notification.permission);
    }
  }, []);

  const completedMeals = localMeals.filter((meal) => meal.completed).length;
  const waterPercent = Math.min(100, Math.round((summary.water_ml / summary.water_goal_ml) * 100));
  const macros = useMemo(
    () =>
      localMeals.reduce(
        (total, meal) => ({
          protein: total.protein + meal.protein_g,
          carbs: total.carbs + meal.carbs_g,
          fat: total.fat + meal.fat_g
        }),
        { protein: 0, carbs: 0, fat: 0 }
      ),
    [localMeals]
  );

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotifications("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifications(permission);
  }

  function completeMeal(id: string) {
    setLocalMeals((current) =>
      current.map((meal) => (meal.id === id ? { ...meal, completed: true } : meal))
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Meal compliance"
          value={`${completedMeals}/${localMeals.length}`}
          detail={`${Math.round((completedMeals / localMeals.length) * 100)}% complete today`}
          icon={<UtensilIcon />}
        />
        <MetricCard
          label="Latest weight"
          value={`${summary.latest_weight_kg} kg`}
          detail="Goal: 72 kg"
          icon={<Scale size={20} />}
        />
        <MetricCard
          label="Water intake"
          value={`${summary.water_ml} ml`}
          detail={`${waterPercent}% of ${summary.water_goal_ml} ml`}
          icon={<GlassWater size={20} />}
        />
        <MetricCard
          label="Monthly score"
          value={`${summary.monthly_score}`}
          detail="Meals, gym, water, weight"
          icon={<ShieldCheck size={20} />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Today&apos;s meals</h2>
              <p className="text-sm text-ink/65">
                Planned macros: {macros.protein}g protein, {macros.carbs}g carbs, {macros.fat}g fat
              </p>
            </div>
            <button className="grid size-10 place-items-center rounded-md bg-mint text-white" type="button">
              <Plus size={18} />
            </button>
          </div>

          <div className="grid gap-3">
            {localMeals.map((meal) => (
              <article
                key={meal.id}
                className="grid gap-3 rounded-lg border border-ink/10 bg-white/60 p-3 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-lemon/40 px-2 py-1 text-xs font-semibold capitalize text-ink">
                      {meal.meal_type}
                    </span>
                    <span className="text-xs text-ink/55">{String(meal.scheduled_time).slice(0, 5)}</span>
                  </div>
                  <h3 className="font-semibold">{meal.name}</h3>
                  <p className="mt-1 text-sm text-ink/65">
                    {meal.calories} kcal • P {meal.protein_g}g • C {meal.carbs_g}g • F {meal.fat_g}g
                  </p>
                </div>
                <button
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                    meal.completed ? "bg-mint/15 text-mint" : "bg-coral text-white"
                  }`}
                  disabled={meal.completed}
                  onClick={() => completeMeal(meal.id)}
                  type="button"
                >
                  <Check size={16} />
                  {meal.completed ? "Done" : "Complete"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Gym tracker</h2>
                <p className="text-sm capitalize text-ink/65">{gymStatus.replaceAll("_", " ")}</p>
              </div>
              <Dumbbell className="text-coral" size={24} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setGymStatus("checked_in")}
                type="button"
              >
                Check in
              </button>
              <button
                className="rounded-md border border-ink/15 bg-white/60 px-4 py-2 text-sm font-semibold"
                onClick={() => setGymStatus("completed")}
                type="button"
              >
                Check out
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
            <h2 className="text-lg font-semibold">PWA notifications</h2>
            <p className="mt-1 text-sm text-ink/65">
              Current browser permission: <span className="font-semibold">{notifications}</span>
            </p>
            <button
              className="mt-4 w-full rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white"
              onClick={requestNotifications}
              type="button"
            >
              Enable reminders
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Weight progress</h2>
          <p className="text-sm text-ink/65">Recent trend from weight logs</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.weight_trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="weightFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#4fae8a" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#4fae8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#17212618" vertical={false} />
              <XAxis dataKey="logged_on" tick={{ fill: "#45616f", fontSize: 12 }} />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fill: "#45616f", fontSize: 12 }} />
              <Tooltip />
              <Area
                dataKey="weight_kg"
                fill="url(#weightFill)"
                stroke="#4fae8a"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
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

function UtensilIcon() {
  return <span className="text-base font-bold">M</span>;
}
