"use client";

import type { GroceryList, GroceryListItem, MealPlanDetail } from "@fittrack/shared-types";
import { CalendarRange, ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { getGroceryList } from "@/lib/api";

type RangeMode = "week" | "month";

export function GroceryListPanel({ plan }: { plan: MealPlanDetail | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const initialStart = plan && today >= plan.starts_on && today <= (plan.ends_on ?? plan.starts_on)
    ? today
    : plan?.starts_on ?? today;
  const [mode, setMode] = useState<RangeMode>("week");
  const [startOn, setStartOn] = useState(initialStart);
  const [endOn, setEndOn] = useState(plan ? addDays(initialStart, 6, plan.ends_on) : initialStart);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!plan) return;
    const nextStart = mode === "month" ? plan.starts_on : startOn;
    const nextEnd = mode === "month" ? plan.ends_on ?? plan.starts_on : addDays(nextStart, 6, plan.ends_on);
    setStartOn(nextStart);
    setEndOn(nextEnd);
  }, [mode, plan]);

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    setLoading(true);
    getGroceryList(plan.id, startOn, endOn)
      .then((data) => {
        if (!cancelled) setGroceryList(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plan, startOn, endOn]);

  const groupedItems = useMemo(() => groupByCategory(groceryList?.items ?? []), [groceryList]);

  if (!plan) {
    return (
      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <h2 className="text-lg font-semibold">Shopping list</h2>
        <p className="mt-1 text-sm text-ink/65">Create or seed a meal plan to generate groceries.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-steel">
            <ShoppingBasket size={17} />
            Grocery planning
          </div>
          <h2 className="text-xl font-bold">Shopping list</h2>
          <p className="mt-1 text-sm text-ink/65">
            Ingredients calculated from planned meals between {startOn} and {endOn}.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="inline-grid grid-cols-2 rounded-md border border-ink/10 bg-white/70 p-1">
            <ModeButton active={mode === "week"} onClick={() => setMode("week")}>
              Week
            </ModeButton>
            <ModeButton active={mode === "month"} onClick={() => setMode("month")}>
              Month
            </ModeButton>
          </div>
          <DateInput
            disabled={mode === "month"}
            label="Start"
            value={startOn}
            onChange={(value) => {
              setMode("week");
              setStartOn(value);
              setEndOn(addDays(value, 6, plan.ends_on));
            }}
          />
          <DateInput
            disabled={mode === "month"}
            label="End"
            value={endOn}
            onChange={(value) => {
              setMode("week");
              setEndOn(value);
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white/55 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <CalendarRange size={16} />
            {mode === "month" ? "Whole month" : "Selected week"}
          </div>
          <span className="text-sm text-ink/60">
            {loading ? "Loading..." : `${groceryList?.items.length ?? 0} grocery items`}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {groupedItems.length ? (
            groupedItems.map(([category, items]) => (
              <div className="rounded-lg border border-ink/10 bg-white p-3" key={category}>
                <h3 className="mb-2 text-sm font-bold capitalize text-ink">{category}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div className="flex items-center justify-between gap-3 text-sm" key={`${item.ingredient_id}-${item.unit}`}>
                      <span className="min-w-0 font-medium">{item.name}</span>
                      <span className="shrink-0 rounded bg-panel px-2 py-1 font-semibold">
                        {formatQuantity(item.quantity)} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/60">No ingredient quantities found for this range.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ModeButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded px-3 py-2 text-sm font-semibold ${active ? "bg-ink text-white" : "text-ink/70"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function DateInput({
  disabled,
  label,
  onChange,
  value
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-ink/60">
      {label}
      <input
        className="h-10 rounded-lg border border-ink/10 bg-white px-3 text-sm text-ink disabled:bg-ink/5"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

function groupByCategory(items: GroceryListItem[]) {
  const groups = new Map<string, GroceryListItem[]>();
  for (const item of items) {
    groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  }
  return Array.from(groups.entries());
}

function addDays(dateKey: string, days: number, maxDate?: string | null) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  const next = date.toISOString().slice(0, 10);
  return maxDate && next > maxDate ? maxDate : next;
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
