import { Activity, Bell, Dumbbell, Droplets, LineChart, Settings, Utensils } from "lucide-react";

import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSummary, getTodayMeals } from "@/lib/api";

const navItems = [
  { label: "Dashboard", icon: Activity },
  { label: "Meals", icon: Utensils },
  { label: "Gym", icon: Dumbbell },
  { label: "Progress", icon: LineChart },
  { label: "Settings", icon: Settings }
];

export default async function Home() {
  const [summary, meals] = await Promise.all([getDashboardSummary(), getTodayMeals()]);

  return (
    <main className="app-shell mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 md:px-6 lg:px-8">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-mint text-white">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold leading-5">FitTrack</p>
            <p className="text-sm text-steel">Daily operating system</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-ink/75 transition hover:bg-ink/5 hover:text-ink"
              type="button"
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 pb-24 lg:pb-4">
        <header className="mb-5 flex flex-col gap-4 rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-steel">Today</p>
            <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Your FitTrack dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink/70">
              Meals, gym, water, and body metrics in one installable PWA.
            </p>
          </div>
          <button
            className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            <Bell size={17} />
            Notifications
          </button>
        </header>

        <DashboardClient meals={meals} summary={summary} />
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-lg border border-ink/10 bg-panel/95 p-1 shadow-soft backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-ink/70"
            type="button"
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
