"use client";

import { useState } from "react";
import MetricSelect from "@/components/MetricSelect";

export default function Dashboard() {
  const [metric, setMetric] = useState("co2");

  const metricOptions = [
    { value: "co2", label: "CO₂", meta: "ppm" },
    { value: "temp", label: "Temperatur", meta: "°C" },
    { value: "humidity", label: "Luftfugtighed", meta: "%" },
    { value: "water_total", label: "Vandmåler", meta: "m³" },

    // eller hvis du bruger water_usage:
    // { value: "water_usage", label: "Vandforbrug", meta: "L" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <MetricSelect value={metric} onChange={setMetric} options={metricOptions} />
        <button style={logoutBtn}>Log ud</button>
      </div>

      <div style={{ color: "white", marginTop: 20 }}>
        Valgt: <b>{metric}</b>
      </div>
    </div>
  );
}

const logoutBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.9)",
};
