import { AppShell } from "@/components/layout/app-shell";
import { GroceryListPanel } from "@/components/modules/grocery-list";
import { getMealPlan, getMealPlans } from "@/lib/api";

export default async function ShoppingPage() {
  const plans = await getMealPlans();
  const firstPlan = plans[0] ? await getMealPlan(plans[0].id) : null;

  return (
    <AppShell eyebrow="Groceries" title="Shopping">
      <GroceryListPanel plan={firstPlan} />
    </AppShell>
  );
}
