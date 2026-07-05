import { AppShell } from "@/components/layout/app-shell";
import { RecipeList } from "@/components/modules/recipe-list";
import { getRecipes } from "@/lib/api";

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <AppShell eyebrow="Meal plan" title="Recipes">
      <RecipeList recipes={recipes} />
    </AppShell>
  );
}
