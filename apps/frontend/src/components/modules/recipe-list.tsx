import type { Recipe } from "@fittrack/shared-types";
import { ArrowRight, NotebookTabs } from "lucide-react";
import Link from "next/link";

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  if (!recipes.length) {
    return (
      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <h2 className="text-lg font-semibold">Recipes</h2>
        <p className="mt-1 text-sm text-ink/65">Seed recipe data to see meal-plan recipes here.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <Link
          className="group rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-mint/40"
          href={`/recipes/${recipe.id}`}
          key={recipe.id}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-mint/15 text-mint">
              <NotebookTabs size={19} />
            </div>
            <ArrowRight className="text-ink/35 transition group-hover:translate-x-1" size={18} />
          </div>
          <h2 className="text-lg font-bold">{recipe.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-ink/65">{recipe.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="rounded bg-white/70 px-2 py-1 font-semibold text-ink/70">
              {recipe.planned_meals_count} planned meals
            </span>
            <span className="font-semibold text-mint">Details</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
