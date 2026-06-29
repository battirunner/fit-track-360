"use client";

import type { BloodPressureLog, BodyMeasurement, ProfileOverview } from "@fittrack/shared-types";
import { Activity, Edit3, HeartPulse, Ruler, Save, Trash2, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";

import { deleteJson, fallbackProfile, postJson, putJson } from "@/lib/api";

type ProfileForm = {
  full_name: string;
  age: string;
  sex: string;
  height_cm: string;
  goal_weight_kg: string;
  activity_level: string;
  medical_notes: string;
};

type MeasurementForm = {
  id?: string;
  measured_on: string;
  weight_kg: string;
  waist_cm: string;
  chest_cm: string;
  hip_cm: string;
  arm_cm: string;
  thigh_cm: string;
  body_fat_percent: string;
  notes: string;
};

type BloodPressureForm = {
  id?: string;
  measured_at: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyMeasurement: MeasurementForm = {
  measured_on: today,
  weight_kg: "",
  waist_cm: "",
  chest_cm: "",
  hip_cm: "",
  arm_cm: "",
  thigh_cm: "",
  body_fat_percent: "",
  notes: ""
};

const emptyBloodPressure: BloodPressureForm = {
  measured_at: toDateTimeLocal(new Date().toISOString()),
  systolic: "",
  diastolic: "",
  pulse: "",
  notes: ""
};

export function ProfileManager({ initialOverview }: { initialOverview: ProfileOverview }) {
  const [overview, setOverview] = useState(initialOverview);
  const [profileForm, setProfileForm] = useState<ProfileForm>(profileToForm(initialOverview));
  const [measurementForm, setMeasurementForm] = useState<MeasurementForm>({ ...emptyMeasurement });
  const [bloodPressureForm, setBloodPressureForm] = useState<BloodPressureForm>({
    ...emptyBloodPressure
  });
  const [message, setMessage] = useState("");

  async function refreshOverview() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/v1/profile`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      setMessage("Profile saved, but refresh failed.");
      return;
    }
    const nextOverview = (await response.json()) as ProfileOverview;
    setOverview(nextOverview);
    setProfileForm(profileToForm(nextOverview));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextOverview = await putJson<ProfileOverview, object>("/api/v1/profile", {
      full_name: profileForm.full_name,
      age: nullableNumber(profileForm.age),
      sex: nullableString(profileForm.sex),
      height_cm: nullableNumber(profileForm.height_cm),
      goal_weight_kg: nullableNumber(profileForm.goal_weight_kg),
      activity_level: nullableString(profileForm.activity_level),
      medical_notes: nullableString(profileForm.medical_notes)
    });
    setOverview(nextOverview);
    setProfileForm(profileToForm(nextOverview));
    setMessage("Profile updated.");
  }

  async function clearProfileInfo() {
    const nextOverview = await deleteJson<ProfileOverview>("/api/v1/profile");
    setOverview(nextOverview);
    setProfileForm(profileToForm(nextOverview));
    setMessage("Optional profile info cleared.");
  }

  async function saveMeasurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      measured_on: measurementForm.measured_on || today,
      weight_kg: nullableNumber(measurementForm.weight_kg),
      waist_cm: nullableNumber(measurementForm.waist_cm),
      chest_cm: nullableNumber(measurementForm.chest_cm),
      hip_cm: nullableNumber(measurementForm.hip_cm),
      arm_cm: nullableNumber(measurementForm.arm_cm),
      thigh_cm: nullableNumber(measurementForm.thigh_cm),
      body_fat_percent: nullableNumber(measurementForm.body_fat_percent),
      notes: nullableString(measurementForm.notes)
    };

    if (measurementForm.id) {
      await putJson<BodyMeasurement, object>(
        `/api/v1/profile/measurements/${measurementForm.id}`,
        payload
      );
      setMessage("Measurement updated.");
    } else {
      await postJson<BodyMeasurement, object>("/api/v1/profile/measurements", payload);
      setMessage("Measurement added.");
    }
    setMeasurementForm({ ...emptyMeasurement });
    await refreshOverview();
  }

  async function deleteMeasurement(id: string) {
    await deleteJson<{ deleted: boolean }>(`/api/v1/profile/measurements/${id}`);
    setMeasurementForm({ ...emptyMeasurement });
    setMessage("Measurement deleted.");
    await refreshOverview();
  }

  async function saveBloodPressure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      measured_at: bloodPressureForm.measured_at
        ? new Date(bloodPressureForm.measured_at).toISOString()
        : new Date().toISOString(),
      systolic: Number(bloodPressureForm.systolic),
      diastolic: Number(bloodPressureForm.diastolic),
      pulse: nullableNumber(bloodPressureForm.pulse),
      notes: nullableString(bloodPressureForm.notes)
    };

    if (bloodPressureForm.id) {
      await putJson<BloodPressureLog, object>(
        `/api/v1/profile/blood-pressure/${bloodPressureForm.id}`,
        payload
      );
      setMessage("Blood pressure reading updated.");
    } else {
      await postJson<BloodPressureLog, object>("/api/v1/profile/blood-pressure", payload);
      setMessage("Blood pressure reading added.");
    }
    setBloodPressureForm({ ...emptyBloodPressure });
    await refreshOverview();
  }

  async function deleteBloodPressure(id: string) {
    await deleteJson<{ deleted: boolean }>(`/api/v1/profile/blood-pressure/${id}`);
    setBloodPressureForm({ ...emptyBloodPressure });
    setMessage("Blood pressure reading deleted.");
    await refreshOverview();
  }

  const latest = overview.latest_measurement;
  const average = overview.blood_pressure_average_last_7_days;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-mint/15 text-mint">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{overview.user.full_name}</h2>
              <p className="text-sm text-ink/65">{overview.user.email}</p>
            </div>
          </div>
          {message ? <p className="text-sm font-medium text-mint">{message}</p> : null}
        </div>

        <form className="grid gap-3 lg:grid-cols-4" onSubmit={saveProfile}>
          <TextField
            label="Name"
            value={profileForm.full_name}
            onChange={(value) => setProfileForm({ ...profileForm, full_name: value })}
            required
          />
          <TextField
            label="Age"
            type="number"
            value={profileForm.age}
            onChange={(value) => setProfileForm({ ...profileForm, age: value })}
          />
          <TextField
            label="Sex"
            value={profileForm.sex}
            onChange={(value) => setProfileForm({ ...profileForm, sex: value })}
          />
          <TextField
            label="Height (cm)"
            type="number"
            value={profileForm.height_cm}
            onChange={(value) => setProfileForm({ ...profileForm, height_cm: value })}
          />
          <TextField
            label="Goal weight (kg)"
            type="number"
            value={profileForm.goal_weight_kg}
            onChange={(value) => setProfileForm({ ...profileForm, goal_weight_kg: value })}
          />
          <TextField
            label="Activity level"
            value={profileForm.activity_level}
            onChange={(value) => setProfileForm({ ...profileForm, activity_level: value })}
            className="lg:col-span-2"
          />
          <TextField
            label="Medical notes"
            value={profileForm.medical_notes}
            onChange={(value) => setProfileForm({ ...profileForm, medical_notes: value })}
            className="lg:col-span-4"
          />
          <div className="flex flex-wrap gap-2 lg:col-span-4">
            <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} />
              Save profile
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-rose/30 px-4 py-2 text-sm font-semibold text-rose"
              onClick={clearProfileInfo}
              type="button"
            >
              <Trash2 size={16} />
              Clear optional info
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-ink/10 bg-white/75 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Ruler size={18} className="text-mint" />
            <h3 className="font-semibold">Latest measurements</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Weight" value={formatMetric(latest?.weight_kg, "kg")} />
            <Metric label="Waist" value={formatMetric(latest?.waist_cm, "cm")} />
            <Metric label="Chest" value={formatMetric(latest?.chest_cm, "cm")} />
            <Metric label="Hip" value={formatMetric(latest?.hip_cm, "cm")} />
            <Metric label="Arm" value={formatMetric(latest?.arm_cm, "cm")} />
            <Metric label="Thigh" value={formatMetric(latest?.thigh_cm, "cm")} />
            <Metric label="Body fat" value={formatMetric(latest?.body_fat_percent, "%")} />
            <Metric label="Date" value={latest?.measured_on ?? "-"} />
          </div>
        </div>

        <form className="rounded-lg border border-ink/10 bg-white/75 p-4" onSubmit={saveMeasurement}>
          <div className="mb-3 flex items-center gap-2">
            <Edit3 size={18} className="text-mint" />
            <h3 className="font-semibold">
              {measurementForm.id ? "Update measurement" : "Add measurement"}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="Date"
              type="date"
              value={measurementForm.measured_on}
              onChange={(value) => setMeasurementForm({ ...measurementForm, measured_on: value })}
            />
            <TextField
              label="Weight (kg)"
              type="number"
              value={measurementForm.weight_kg}
              onChange={(value) => setMeasurementForm({ ...measurementForm, weight_kg: value })}
            />
            <TextField
              label="Waist (cm)"
              type="number"
              value={measurementForm.waist_cm}
              onChange={(value) => setMeasurementForm({ ...measurementForm, waist_cm: value })}
            />
            <TextField
              label="Chest (cm)"
              type="number"
              value={measurementForm.chest_cm}
              onChange={(value) => setMeasurementForm({ ...measurementForm, chest_cm: value })}
            />
            <TextField
              label="Hip (cm)"
              type="number"
              value={measurementForm.hip_cm}
              onChange={(value) => setMeasurementForm({ ...measurementForm, hip_cm: value })}
            />
            <TextField
              label="Arm (cm)"
              type="number"
              value={measurementForm.arm_cm}
              onChange={(value) => setMeasurementForm({ ...measurementForm, arm_cm: value })}
            />
            <TextField
              label="Thigh (cm)"
              type="number"
              value={measurementForm.thigh_cm}
              onChange={(value) => setMeasurementForm({ ...measurementForm, thigh_cm: value })}
            />
            <TextField
              label="Body fat (%)"
              type="number"
              value={measurementForm.body_fat_percent}
              onChange={(value) =>
                setMeasurementForm({ ...measurementForm, body_fat_percent: value })
              }
            />
            <TextField
              label="Notes"
              value={measurementForm.notes}
              onChange={(value) => setMeasurementForm({ ...measurementForm, notes: value })}
              className="sm:col-span-2 lg:col-span-4"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} />
              Save measurement
            </button>
            {measurementForm.id ? (
              <button
                className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-semibold"
                onClick={() => setMeasurementForm({ ...emptyMeasurement })}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-ink/10 bg-white/75 p-4">
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse size={18} className="text-rose" />
            <h3 className="font-semibold">Blood pressure</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="7-day average" value={formatBloodPressure(average)} />
            <Metric label="Average pulse" value={formatMetric(average.pulse, "bpm")} />
            <Metric label="Readings" value={String(average.count)} />
          </div>
        </div>

        <form className="rounded-lg border border-ink/10 bg-white/75 p-4" onSubmit={saveBloodPressure}>
          <div className="mb-3 flex items-center gap-2">
            <Activity size={18} className="text-rose" />
            <h3 className="font-semibold">
              {bloodPressureForm.id ? "Update reading" : "Add reading"}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="Measured at"
              type="datetime-local"
              value={bloodPressureForm.measured_at}
              onChange={(value) =>
                setBloodPressureForm({ ...bloodPressureForm, measured_at: value })
              }
            />
            <TextField
              label="Systolic"
              type="number"
              value={bloodPressureForm.systolic}
              onChange={(value) => setBloodPressureForm({ ...bloodPressureForm, systolic: value })}
              required
            />
            <TextField
              label="Diastolic"
              type="number"
              value={bloodPressureForm.diastolic}
              onChange={(value) => setBloodPressureForm({ ...bloodPressureForm, diastolic: value })}
              required
            />
            <TextField
              label="Pulse"
              type="number"
              value={bloodPressureForm.pulse}
              onChange={(value) => setBloodPressureForm({ ...bloodPressureForm, pulse: value })}
            />
            <TextField
              label="Notes"
              value={bloodPressureForm.notes}
              onChange={(value) => setBloodPressureForm({ ...bloodPressureForm, notes: value })}
              className="sm:col-span-2 lg:col-span-4"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} />
              Save reading
            </button>
            {bloodPressureForm.id ? (
              <button
                className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-semibold"
                onClick={() => setBloodPressureForm({ ...emptyBloodPressure })}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <HistoryList
          items={overview.measurements}
          title="Measurement history"
          renderItem={(item) => (
            <>
              <div>
                <p className="font-semibold">{item.measured_on}</p>
                <p className="text-sm text-ink/60">
                  {formatMetric(item.weight_kg, "kg")} weight, {formatMetric(item.waist_cm, "cm")} waist
                </p>
              </div>
              <div className="flex gap-1">
                <IconButton
                  label="Edit"
                  onClick={() => setMeasurementForm(measurementToForm(item))}
                >
                  <Edit3 size={16} />
                </IconButton>
                <IconButton label="Delete" onClick={() => deleteMeasurement(item.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </>
          )}
        />
        <HistoryList
          items={overview.blood_pressure_logs}
          title="Blood pressure history"
          renderItem={(item) => (
            <>
              <div>
                <p className="font-semibold">
                  {item.systolic}/{item.diastolic} mmHg
                </p>
                <p className="text-sm text-ink/60">
                  {new Date(item.measured_at).toLocaleString()} ·{" "}
                  {formatMetric(item.pulse, "bpm")}
                </p>
              </div>
              <div className="flex gap-1">
                <IconButton
                  label="Edit"
                  onClick={() => setBloodPressureForm(bloodPressureToForm(item))}
                >
                  <Edit3 size={16} />
                </IconButton>
                <IconButton label="Delete" onClick={() => deleteBloodPressure(item.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </>
          )}
        />
      </section>
    </div>
  );
}

function TextField({
  className = "",
  label,
  onChange,
  required = false,
  type = "text",
  value
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className={`grid gap-1 text-sm ${className}`}>
      <span className="font-medium text-ink/70">{label}</span>
      <input
        className="min-h-10 rounded-lg border border-ink/10 bg-white px-3 py-2 outline-none transition focus:border-mint"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        step={type === "number" ? "0.1" : undefined}
        type={type}
        value={value}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-panel/80 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink/50">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg border border-ink/10 text-ink/70 transition hover:bg-panel"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function HistoryList<T extends { id: string }>({
  items,
  renderItem,
  title
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/75 p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {items.length ? (
          items.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-panel/70 p-3"
              key={item.id}
            >
              {renderItem(item)}
            </div>
          ))
        ) : (
          <p className="text-sm text-ink/60">No records yet.</p>
        )}
      </div>
    </div>
  );
}

function profileToForm(overview: ProfileOverview): ProfileForm {
  return {
    full_name: overview.user.full_name || fallbackProfile.user.full_name,
    age: toInput(overview.user.age),
    sex: overview.user.sex ?? "",
    height_cm: toInput(overview.user.height_cm),
    goal_weight_kg: toInput(overview.user.goal_weight_kg),
    activity_level: overview.user.activity_level ?? "",
    medical_notes: overview.user.medical_notes ?? ""
  };
}

function measurementToForm(item: BodyMeasurement): MeasurementForm {
  return {
    id: item.id,
    measured_on: item.measured_on,
    weight_kg: toInput(item.weight_kg),
    waist_cm: toInput(item.waist_cm),
    chest_cm: toInput(item.chest_cm),
    hip_cm: toInput(item.hip_cm),
    arm_cm: toInput(item.arm_cm),
    thigh_cm: toInput(item.thigh_cm),
    body_fat_percent: toInput(item.body_fat_percent),
    notes: item.notes ?? ""
  };
}

function bloodPressureToForm(item: BloodPressureLog): BloodPressureForm {
  return {
    id: item.id,
    measured_at: toDateTimeLocal(item.measured_at),
    systolic: String(item.systolic),
    diastolic: String(item.diastolic),
    pulse: toInput(item.pulse),
    notes: item.notes ?? ""
  };
}

function nullableNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

function nullableString(value: string) {
  return value.trim() ? value.trim() : null;
}

function toInput(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function formatMetric(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return "-";
  }
  return unit === "%" ? `${value}%` : `${value} ${unit}`;
}

function formatBloodPressure(average: ProfileOverview["blood_pressure_average_last_7_days"]) {
  if (average.systolic === null || average.systolic === undefined) {
    return "-";
  }
  return `${average.systolic}/${average.diastolic ?? "-"} mmHg`;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
