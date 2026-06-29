"use client";

import type { MealPlan, MealPlanDetail } from "@fittrack/shared-types";
import { Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { deleteJson, postJson, putJson } from "@/lib/api";

type PlanForm = {
  title: string;
  description: string;
  starts_on: string;
  ends_on: string;
  target_calories_min: string;
  target_calories_max: string;
  target_protein_min: string;
  target_protein_max: string;
  water_goal_ml: string;
  gym_days_per_week: string;
  notes: string;
};

type MealForm = {
  id?: string;
  planned_on: string;
  meal_type: string;
  name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  scheduled_time: string;
  notes: string;
};

const emptyPlan: PlanForm = {
  title: "",
  description: "",
  starts_on: "2026-07-01",
  ends_on: "2026-07-31",
  target_calories_min: "1850",
  target_calories_max: "1950",
  target_protein_min: "140",
  target_protein_max: "150",
  water_goal_ml: "3000",
  gym_days_per_week: "4",
  notes: ""
};

const emptyMeal: MealForm = {
  planned_on: "2026-07-01",
  meal_type: "breakfast",
  name: "",
  calories: "0",
  protein_g: "0",
  carbs_g: "0",
  fat_g: "0",
  scheduled_time: "08:00",
  notes: ""
};

export function MealPlanManager({
  initialPlans,
  initialDetail
}: {
  initialPlans: MealPlan[];
  initialDetail: MealPlanDetail | null;
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<MealPlanDetail | null>(initialDetail);
  const [planForm, setPlanForm] = useState<PlanForm>(
    initialDetail ? planToForm(initialDetail) : { ...emptyPlan }
  );
  const [mealForm, setMealForm] = useState<MealForm>({ ...emptyMeal });
  const [message, setMessage] = useState("");

  const selectedPlanId = selectedPlan?.id ?? "";
  async function loadPlan(planId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/v1/meals/plans/${planId}`);
    const detail = (await response.json()) as MealPlanDetail;
    setSelectedPlan(detail);
    setPlanForm(planToForm(detail));
    setMealForm((current) => ({ ...current, planned_on: detail.starts_on }));
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = planFormToPayload(planForm);
    const saved = selectedPlan
      ? await putJson<MealPlan, typeof payload>(`/api/v1/meals/plans/${selectedPlan.id}`, payload)
      : await postJson<MealPlan, typeof payload>("/api/v1/meals/plans", payload);

    setPlans((current) => {
      const exists = current.some((plan) => plan.id === saved.id);
      return exists ? current.map((plan) => (plan.id === saved.id ? saved : plan)) : [saved, ...current];
    });
    await loadPlan(saved.id);
    setMessage("Meal plan saved");
  }

  async function deletePlan() {
    if (!selectedPlan) return;
    await deleteJson(`/api/v1/meals/plans/${selectedPlan.id}`);
    setPlans((current) => current.filter((plan) => plan.id !== selectedPlan.id));
    setSelectedPlan(null);
    setPlanForm({ ...emptyPlan });
    setMessage("Meal plan deleted");
  }

  async function saveMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    const payload = mealFormToPayload(mealForm);
    if (mealForm.id) {
      await putJson(`/api/v1/meals/plans/${selectedPlan.id}/meals/${mealForm.id}`, payload);
    } else {
      await postJson(`/api/v1/meals/plans/${selectedPlan.id}/meals`, payload);
    }
    await loadPlan(selectedPlan.id);
    setMealForm({ ...emptyMeal, planned_on: mealForm.planned_on });
    setMessage("Meal saved");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="space-y-4">
        <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Meal plans</h2>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setSelectedPlan(null);
                setPlanForm({ ...emptyPlan });
              }}
              type="button"
            >
              <Plus size={16} />
              New
            </button>
          </div>
          <div className="grid gap-2">
            {plans.map((plan) => (
              <button
                className={`rounded-md border px-3 py-2 text-left ${
                  selectedPlanId === plan.id ? "border-mint bg-mint/10" : "border-ink/10 bg-white/60"
                }`}
                key={plan.id}
                onClick={() => loadPlan(plan.id)}
                type="button"
              >
                <p className="font-semibold">{plan.title}</p>
                <p className="text-xs text-ink/60">
                  {plan.starts_on} to {plan.ends_on ?? "open"} | {plan.meals_count} meals
                </p>
              </button>
            ))}
          </div>
        </div>

        <form className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft" onSubmit={savePlan}>
          <h2 className="mb-4 text-lg font-semibold">{selectedPlan ? "Edit plan" : "Create plan"}</h2>
          <div className="grid gap-3">
            <Field label="Title" onChange={(value) => setPlanForm({ ...planForm, title: value })} required value={planForm.title} />
            <Field label="Description" onChange={(value) => setPlanForm({ ...planForm, description: value })} value={planForm.description} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Starts on" onChange={(value) => setPlanForm({ ...planForm, starts_on: value })} type="date" value={planForm.starts_on} />
              <Field label="Ends on" onChange={(value) => setPlanForm({ ...planForm, ends_on: value })} type="date" value={planForm.ends_on} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Min calories" onChange={(value) => setPlanForm({ ...planForm, target_calories_min: value })} type="number" value={planForm.target_calories_min} />
              <Field label="Max calories" onChange={(value) => setPlanForm({ ...planForm, target_calories_max: value })} type="number" value={planForm.target_calories_max} />
              <Field label="Min protein" onChange={(value) => setPlanForm({ ...planForm, target_protein_min: value })} type="number" value={planForm.target_protein_min} />
              <Field label="Max protein" onChange={(value) => setPlanForm({ ...planForm, target_protein_max: value })} type="number" value={planForm.target_protein_max} />
              <Field label="Water ml" onChange={(value) => setPlanForm({ ...planForm, water_goal_ml: value })} type="number" value={planForm.water_goal_ml} />
              <Field label="Gym days/week" onChange={(value) => setPlanForm({ ...planForm, gym_days_per_week: value })} type="number" value={planForm.gym_days_per_week} />
            </div>
            <Field label="Notes" onChange={(value) => setPlanForm({ ...planForm, notes: value })} value={planForm.notes} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} />
              Save plan
            </button>
            {selectedPlan && (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-semibold text-coral"
                onClick={deletePlan}
                type="button"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {message && <p className="rounded-md bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">{message}</p>}
        {selectedPlan ? (
          <form className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft" onSubmit={saveMeal}>
            <h2 className="mb-4 text-lg font-semibold">{mealForm.id ? "Edit meal" : "Add meal"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date" onChange={(value) => setMealForm({ ...mealForm, planned_on: value })} type="date" value={mealForm.planned_on} />
              <Field label="Type" onChange={(value) => setMealForm({ ...mealForm, meal_type: value })} value={mealForm.meal_type} />
              <Field label="Name" onChange={(value) => setMealForm({ ...mealForm, name: value })} required value={mealForm.name} />
              <Field label="Time" onChange={(value) => setMealForm({ ...mealForm, scheduled_time: value })} type="time" value={mealForm.scheduled_time} />
              <Field label="Calories" onChange={(value) => setMealForm({ ...mealForm, calories: value })} type="number" value={mealForm.calories} />
              <Field label="Protein" onChange={(value) => setMealForm({ ...mealForm, protein_g: value })} type="number" value={mealForm.protein_g} />
              <Field label="Carbs" onChange={(value) => setMealForm({ ...mealForm, carbs_g: value })} type="number" value={mealForm.carbs_g} />
              <Field label="Fat" onChange={(value) => setMealForm({ ...mealForm, fat_g: value })} type="number" value={mealForm.fat_g} />
            </div>
            <div className="mt-3">
              <Field label="Notes" onChange={(value) => setMealForm({ ...mealForm, notes: value })} value={mealForm.notes} />
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} />
              Save meal
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
            <p className="text-sm text-ink/65">Select a meal plan or create a new one.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-steel">{label}</span>
      <input
        className="w-full rounded-md border border-ink/15 bg-white/80 px-3 py-2 outline-none focus:border-mint"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function planToForm(plan: MealPlan): PlanForm {
  return {
    title: plan.title,
    description: plan.description ?? "",
    starts_on: plan.starts_on,
    ends_on: plan.ends_on ?? "",
    target_calories_min: String(plan.target_calories_min ?? ""),
    target_calories_max: String(plan.target_calories_max ?? ""),
    target_protein_min: String(plan.target_protein_min ?? ""),
    target_protein_max: String(plan.target_protein_max ?? ""),
    water_goal_ml: String(plan.water_goal_ml ?? 3000),
    gym_days_per_week: String(plan.gym_days_per_week ?? ""),
    notes: plan.notes ?? ""
  };
}

function planFormToPayload(form: PlanForm) {
  return {
    title: form.title,
    description: form.description || null,
    starts_on: form.starts_on,
    ends_on: form.ends_on || null,
    target_calories_min: numberOrNull(form.target_calories_min),
    target_calories_max: numberOrNull(form.target_calories_max),
    target_protein_min: numberOrNull(form.target_protein_min),
    target_protein_max: numberOrNull(form.target_protein_max),
    water_goal_ml: Number(form.water_goal_ml || 3000),
    gym_days_per_week: numberOrNull(form.gym_days_per_week),
    notes: form.notes || null
  };
}

function mealFormToPayload(form: MealForm) {
  return {
    planned_on: form.planned_on || null,
    meal_type: form.meal_type,
    name: form.name,
    calories: Number(form.calories || 0),
    protein_g: Number(form.protein_g || 0),
    carbs_g: Number(form.carbs_g || 0),
    fat_g: Number(form.fat_g || 0),
    scheduled_time: form.scheduled_time || null,
    notes: form.notes || null
  };
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}
