import { ArrowLeft, CalendarDays, ExternalLink, Flame, NotebookTabs, Utensils } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getRecipe } from "@/lib/api";

export default async function RecipeDetailPage({
  params
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  return (
    <AppShell
      action={
        <Link
          className="inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-white/70 px-3 py-2 text-sm font-semibold text-ink/70"
          href="/recipes"
        >
          <ArrowLeft size={16} />
          All recipes
        </Link>
      }
      eyebrow="Recipe"
      title={recipe.title}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-steel">
              <NotebookTabs size={17} />
              Recipe details
            </div>
            <p className="text-base text-ink/75">{recipe.description}</p>
          </div>

          <DetailBlock title="Main ingredients" icon={<Utensils size={18} />}>
            <p>{recipe.main_ingredients}</p>
          </DetailBlock>

          <DetailBlock title="How to make" icon={<Flame size={18} />}>
            <p>{recipe.instructions}</p>
          </DetailBlock>

          {recipe.video_url ? (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
              href={recipe.video_url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink size={16} />
              Open video search
            </a>
          ) : null}
        </section>

        <aside className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-steel">
            <CalendarDays size={17} />
            Used in meal plan
          </div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {recipe.used_in_meals.map((meal) => (
              <div className="rounded-lg border border-ink/10 bg-white/70 p-3" key={meal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{meal.planned_on}</p>
                    <p className="text-sm capitalize text-ink/60">{meal.meal_type}</p>
                  </div>
                  <span className="rounded bg-mint/15 px-2 py-1 text-xs font-bold text-mint">
                    {meal.calories} cal
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/75">{meal.name}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function DetailBlock({
  children,
  icon,
  title
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/75 p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
        {icon}
        {title}
      </div>
      <div className="text-sm leading-6 text-ink/75">{children}</div>
    </section>
  );
}
