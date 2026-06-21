import { AppShell } from "@/components/layout/app-shell";
import { MealList } from "@/components/modules/meal-list";
import { MealPlanManager } from "@/components/modules/meal-plan-manager";
import { getMealPlan, getMealPlans, getTodayMeals } from "@/lib/api";

export default async function MealsPage() {
  const [meals, plans] = await Promise.all([getTodayMeals(), getMealPlans()]);
  const firstPlan = plans[0] ? await getMealPlan(plans[0].id) : null;

  return (
    <AppShell eyebrow="Nutrition" title="Meal plan">
      <div className="space-y-5">
        <MealList meals={meals} />
        <MealPlanManager initialDetail={firstPlan} initialPlans={plans} />
      </div>
    </AppShell>
  );
}
