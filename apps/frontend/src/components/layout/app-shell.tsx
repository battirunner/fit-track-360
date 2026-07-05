import {
  Activity,
  Dumbbell,
  LineChart,
  NotebookTabs,
  Settings,
  ShoppingBasket,
  User,
  Utensils,
  Weight
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/recipes", label: "Recipes", icon: NotebookTabs },
  { href: "/shopping", label: "Shopping", icon: ShoppingBasket },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/weight", label: "Weight", icon: Weight },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings }
];

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AppShell({ title, eyebrow = "FitTrack", children, action }: Props) {
  return (
    <main className="app-shell mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 md:px-6 lg:px-8">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft lg:block">
        <Link className="mb-8 flex items-center gap-3" href="/dashboard">
          <div className="grid size-11 place-items-center rounded-lg bg-mint text-white">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold leading-5">FitTrack</p>
            <p className="text-sm text-steel">Daily operating system</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-ink/75 transition hover:bg-ink/5 hover:text-ink"
              href={item.href}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 pb-24 lg:pb-4">
        <header className="mb-5 flex flex-col gap-4 rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-steel">{eyebrow}</p>
            <h1 className="text-2xl font-bold tracking-normal md:text-3xl">{title}</h1>
          </div>
          {action}
        </header>
        {children}
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-lg border border-ink/10 bg-panel/95 p-1 shadow-soft backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-ink/70"
            href={item.href}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
