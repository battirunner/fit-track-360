"use client";

import type { WeightLog } from "@fittrack/shared-types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function WeightChart({ data }: { data: WeightLog[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#4fae8a" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#4fae8a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#17212618" vertical={false} />
          <XAxis dataKey="logged_on" tick={{ fill: "#45616f", fontSize: 12 }} />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fill: "#45616f", fontSize: 12 }} />
          <Tooltip />
          <Area dataKey="weight_kg" fill="url(#weightFill)" stroke="#4fae8a" strokeWidth={3} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
