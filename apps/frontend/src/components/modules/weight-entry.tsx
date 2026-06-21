"use client";

import { Plus, Scale } from "lucide-react";
import { FormEvent, useState } from "react";

import { postJson } from "@/lib/api";

export function WeightEntry({ latestWeight }: { latestWeight: number }) {
  const [weight, setWeight] = useState(String(latestWeight || ""));
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await postJson("/api/v1/weight", { weight_kg: Number(weight) });
    setMessage("Weight log saved");
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Weight log</h2>
          <p className="text-sm text-ink/65">Latest: {latestWeight} kg</p>
        </div>
        <Scale className="text-mint" size={24} />
      </div>
      <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
        <input
          className="rounded-md border border-ink/15 bg-white/80 px-3 py-2 outline-none focus:border-mint"
          min="20"
          onChange={(event) => setWeight(event.target.value)}
          step="0.1"
          type="number"
          value={weight}
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
          <Plus size={17} />
          Save
        </button>
      </form>
      {message && <p className="mt-3 rounded-md bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">{message}</p>}
    </section>
  );
}
