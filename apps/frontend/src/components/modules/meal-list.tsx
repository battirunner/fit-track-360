"use client";

import type { Meal } from "@fittrack/shared-types";
import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { postJson } from "@/lib/api";

export function MealList({ meals }: { meals: Meal[] }) {
  const [localMeals, setLocalMeals] = useState(meals);
  const [message, setMessage] = useState("");
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

  async function completeMeal(meal: Meal) {
    setLocalMeals((current) =>
      current.map((item) => (item.id === meal.id ? { ...item, completed: true } : item))
    );
    await postJson("/api/v1/meals/log", {
      meal_id: meal.id,
      meal_type: meal.meal_type,
      completed: true
    });
    setMessage(`${meal.meal_type} logged`);
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
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

      {message && <p className="mb-3 rounded-md bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">{message}</p>}

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
                {meal.calories} kcal | P {meal.protein_g}g | C {meal.carbs_g}g | F {meal.fat_g}g
              </p>
            </div>
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                meal.completed ? "bg-mint/15 text-mint" : "bg-coral text-white"
              }`}
              disabled={meal.completed}
              onClick={() => completeMeal(meal)}
              type="button"
            >
              <Check size={16} />
              {meal.completed ? "Done" : "Complete"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
