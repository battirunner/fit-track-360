"use client";

import { Dumbbell } from "lucide-react";
import { useState } from "react";

import { postJson } from "@/lib/api";

export function GymPanel({ initialStatus }: { initialStatus: string }) {
  const [gymStatus, setGymStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");

  async function checkIn() {
    await postJson("/api/v1/gym/checkin", {});
    setGymStatus("checked_in");
    setMessage("Gym check-in saved");
  }

  async function checkOut() {
    await postJson("/api/v1/gym/checkout", {});
    setGymStatus("completed");
    setMessage("Workout completed");
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gym tracker</h2>
          <p className="text-sm capitalize text-ink/65">{gymStatus.replaceAll("_", " ")}</p>
        </div>
        <Dumbbell className="text-coral" size={24} />
      </div>
      {message && <p className="mb-3 rounded-md bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">{message}</p>}
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={checkIn} type="button">
          Check in
        </button>
        <button
          className="rounded-md border border-ink/15 bg-white/60 px-4 py-2 text-sm font-semibold"
          onClick={checkOut}
          type="button"
        >
          Check out
        </button>
      </div>
    </section>
  );
}
