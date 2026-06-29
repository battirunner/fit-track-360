"use client";

import type { Meal, MealPlanDay, MealPlanDetail } from "@fittrack/shared-types";
import { CalendarDays, Droplets, Flame, ListChecks, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type CalendarCell = {
  date: string;
  dayNumber: number;
  meals: Meal[];
  planDay?: MealPlanDay;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MealCalendar({ plan }: { plan: MealPlanDetail | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const initialDate =
    plan?.days.some((day) => day.planned_on === today) && today >= plan.starts_on
      ? today
      : plan?.starts_on ?? today;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const calendar = useMemo(() => {
    if (!plan) return { blanks: 0, cells: [] as CalendarCell[] };

    const dayMap = new Map(plan.days.map((day) => [day.planned_on, day]));
    const mealsByDate = new Map<string, Meal[]>();
    for (const meal of plan.meals) {
      if (!meal.planned_on) continue;
      mealsByDate.set(meal.planned_on, [...(mealsByDate.get(meal.planned_on) ?? []), meal]);
    }

    const start = parseDate(plan.starts_on);
    const end = parseDate(plan.ends_on ?? plan.starts_on);
    const cells: CalendarCell[] = [];
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = toDateKey(cursor);
      cells.push({
        date,
        dayNumber: cursor.getUTCDate(),
        meals: mealsByDate.get(date) ?? [],
        planDay: dayMap.get(date)
      });
    }

    return { blanks: start.getUTCDay(), cells };
  }, [plan]);

  const selectedCell = calendar.cells.find((cell) => cell.date === selectedDate) ?? calendar.cells[0];
  const groupedMeals = useMemo(
    () =>
      calendar.cells
        .filter((cell) => cell.meals.length > 0)
        .map((cell) => [cell.date, cell.meals] as const),
    [calendar.cells]
  );

  if (!plan) {
    return (
      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <h2 className="text-lg font-semibold">Monthly meal calendar</h2>
        <p className="mt-1 text-sm text-ink/65">Create or seed a meal plan to see the calendar.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-steel">
            <CalendarDays size={17} />
            {formatMonth(plan.starts_on)}
          </div>
          <h2 className="text-xl font-bold">{plan.title}</h2>
          <p className="mt-1 text-sm text-ink/65">
            {plan.starts_on} to {plan.ends_on} | {plan.meals_count} planned meals
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-80">
          <Summary label="Calories" value={`${plan.target_calories_min}-${plan.target_calories_max}`} />
          <Summary label="Protein" value={`${plan.target_protein_min}-${plan.target_protein_max}g`} />
          <Summary label="Water" value={`${plan.water_goal_ml}ml`} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
        <div className="min-h-[520px] rounded-lg border border-ink/10 bg-white/50 p-3">
          <div className="mb-4 inline-grid grid-cols-2 rounded-md border border-ink/10 bg-white/70 p-1">
            <button
              className={`inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                view === "calendar" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => setView("calendar")}
              type="button"
            >
              <CalendarDays size={16} />
              Calendar
            </button>
            <button
              className={`inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                view === "list" ? "bg-ink text-white" : "text-ink/70"
              }`}
              onClick={() => setView("list")}
              type="button"
            >
              <ListChecks size={16} />
              Meals in plan
            </button>
          </div>

          {view === "calendar" ? (
            <CalendarGrid
              blanks={calendar.blanks}
              cells={calendar.cells}
              selectedDate={selectedCell?.date}
              setSelectedDate={setSelectedDate}
              today={today}
            />
          ) : (
            <PlanMealsList groupedMeals={groupedMeals} setSelectedDate={setSelectedDate} />
          )}
        </div>

        <aside className="rounded-lg border border-ink/10 bg-white/60 p-3">
          <DayDetails plan={plan} selectedCell={selectedCell} />
        </aside>
      </div>
    </section>
  );
}

function CalendarGrid({
  blanks,
  cells,
  selectedDate,
  setSelectedDate,
  today
}: {
  blanks: number;
  cells: CalendarCell[];
  selectedDate: string | undefined;
  setSelectedDate: (date: string) => void;
  today: string;
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[560px]">
        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div className="text-center text-xs font-semibold text-steel" key={day}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: blanks }).map((_, index) => (
            <div className="h-24 rounded-md border border-transparent" key={`blank-${index}`} />
          ))}
          {cells.map((cell) => {
            const isSelected = cell.date === selectedDate;
            const isToday = cell.date === today;
            return (
              <button
                className={`flex h-24 min-w-0 flex-col overflow-hidden rounded-md border p-2 text-left transition ${
                  isSelected
                    ? "border-mint bg-mint/15"
                    : isToday
                      ? "border-coral bg-coral/10"
                      : "border-ink/10 bg-panel/80 hover:border-mint/50"
                }`}
                key={cell.date}
                onClick={() => setSelectedDate(cell.date)}
                type="button"
              >
                <span className="mb-2 flex items-center justify-between gap-1">
                  <span className="text-sm font-bold leading-none">{cell.dayNumber}</span>
                  {isToday && (
                    <span className="rounded bg-coral px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      Today
                    </span>
                  )}
                </span>
                <span className="truncate rounded bg-ink/5 px-1.5 py-1 text-[11px] font-semibold leading-none text-ink/70">
                  {cell.meals.length} meals
                </span>
                {cell.planDay?.calories && (
                  <span className="mt-1 truncate rounded bg-mint/10 px-1.5 py-1 text-[11px] font-semibold leading-none text-mint">
                    {cell.planDay.calories} kcal
                  </span>
                )}
                {cell.planDay?.protein_g && (
                  <span className="mt-1 truncate rounded bg-lemon/25 px-1.5 py-1 text-[11px] font-semibold leading-none text-ink/70">
                    P {cell.planDay.protein_g}g
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlanMealsList({
  groupedMeals,
  setSelectedDate
}: {
  groupedMeals: readonly (readonly [string, Meal[]])[];
  setSelectedDate: (date: string) => void;
}) {
  return (
    <div className="h-[446px] overflow-y-auto pr-1">
      <div className="grid gap-4">
        {groupedMeals.map(([plannedOn, meals]) => (
          <div key={plannedOn}>
            <button
              className="mb-2 text-sm font-semibold text-steel hover:text-ink"
              onClick={() => setSelectedDate(plannedOn)}
              type="button"
            >
              {plannedOn}
            </button>
            <div className="grid gap-2 md:grid-cols-2">
              {meals.map((meal) => (
                <button
                  className="rounded-lg border border-ink/10 bg-panel/80 p-3 text-left transition hover:border-mint/50 hover:bg-mint/10"
                  key={meal.id}
                  onClick={() => setSelectedDate(plannedOn)}
                  type="button"
                >
                  <p className="font-semibold capitalize">{meal.meal_type}</p>
                  <p className="text-sm text-ink/75">{meal.name}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {meal.scheduled_time?.slice(0, 5)} | {meal.calories} kcal | P {meal.protein_g}g
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white/60 px-2 py-2">
      <p className="font-bold">{value}</p>
      <p className="text-ink/55">{label}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-panel/80 p-2">
      <div className="mb-1 text-mint">{icon}</div>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[11px] text-ink/55">{label}</p>
    </div>
  );
}

function DayDetails({
  plan,
  selectedCell
}: {
  plan: MealPlanDetail;
  selectedCell: CalendarCell | undefined;
}) {
  if (!selectedCell) {
    return <p className="text-sm text-ink/65">Select a date.</p>;
  }

  return (
    <div className="flex h-[494px] flex-col overflow-hidden">
      <div className="mb-4 shrink-0">
        <p className="text-sm font-semibold text-steel">{selectedCell.date}</p>
        <h3 className="text-lg font-bold">Daily meal details</h3>
      </div>
      <div className="mb-4 grid shrink-0 grid-cols-3 gap-2">
        <MiniStat
          icon={<Flame size={16} />}
          label="Calories"
          value={selectedCell.planDay?.calories ? `${selectedCell.planDay.calories}` : "-"}
        />
        <MiniStat
          icon={<Utensils size={16} />}
          label="Protein"
          value={selectedCell.planDay?.protein_g ? `${selectedCell.planDay.protein_g}g` : "-"}
        />
        <MiniStat icon={<Droplets size={16} />} label="Water" value={`${plan.water_goal_ml}ml`} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-3">
          {selectedCell.meals.map((meal) => (
            <article className="rounded-md border border-ink/10 bg-panel/80 p-3" key={meal.id}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-bold capitalize">{meal.meal_type}</p>
                <p className="text-xs text-ink/55">{meal.scheduled_time?.slice(0, 5)}</p>
              </div>
              <p className="text-sm text-ink/75">{meal.name}</p>
              <p className="mt-1 text-xs text-ink/55">
                {meal.calories} kcal | P {meal.protein_g}g
              </p>
            </article>
          ))}
        </div>
        {(selectedCell.planDay?.preparation || selectedCell.planDay?.water_guidance) && (
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            {selectedCell.planDay.preparation && <p>{selectedCell.planDay.preparation}</p>}
            {selectedCell.planDay.water_guidance && <p>{selectedCell.planDay.water_guidance}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    parseDate(value)
  );
}
