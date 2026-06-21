import { User } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

export default function ProfilePage() {
  return (
    <AppShell eyebrow="Account" title="Profile">
      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-mint/15 text-mint">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Demo Athlete</h2>
            <p className="text-sm text-ink/65">demo@fittrack.dev</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Height" value="175 cm" />
          <Info label="Goal weight" value="72 kg" />
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/60 p-3">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
