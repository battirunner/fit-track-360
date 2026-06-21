import { AppShell } from "@/components/layout/app-shell";
import { NotificationPanel } from "@/components/modules/notification-panel";

const reminders = ["Breakfast", "Lunch", "Dinner", "Gym", "Missing log", "Weekly review"];

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Preferences" title="Settings">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <NotificationPanel />
        <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold">Reminder schedule</h2>
          <div className="mt-4 grid gap-3">
            {reminders.map((reminder) => (
              <label
                className="flex items-center justify-between rounded-lg border border-ink/10 bg-white/60 p-3"
                key={reminder}
              >
                <span className="font-medium">{reminder}</span>
                <input className="size-5 accent-mint" defaultChecked type="checkbox" />
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
