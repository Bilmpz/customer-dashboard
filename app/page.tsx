"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// ECharts skal loades client-side
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Measurement = {
  id: number;
  device_id: string;
  ts: string;
  metric: string;
  value: number;
  unit: string | null;
};

const METRICS = [
  { key: "co2", label: "CO₂", unitHint: "ppm" },
  { key: "temp", label: "Temperatur", unitHint: "°C" },
  { key: "humidity", label: "Luftfugtighed", unitHint: "%" },
];

function formatValue(v: number) {
  return Number.isFinite(v) ? v.toFixed(1) : "-";
}

function co2Status(v: number) {
  // super simple thresholds (kan justeres)
  if (v < 800) return { text: "God", chip: "chipGood" };
  if (v < 1200) return { text: "Okay", chip: "chipOk" };
  return { text: "Dårlig", chip: "chipBad" };
}

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string>("co2");

  const [chartData, setChartData] = useState<Measurement[]>([]);
  const [latestRows, setLatestRows] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        setErrorMsg(userErr.message);
        setLoading(false);
        return;
      }

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setEmail(userData.user.email ?? "");

      // 1) Hent data til grafen (kun den valgte metric)
      const { data: series, error: seriesErr } = await supabase
        .from("measurements")
        .select("id, device_id, ts, metric, value, unit")
        .eq("metric", selectedMetric)
        .order("ts", { ascending: true })
        .limit(500);

      if (seriesErr) {
        setErrorMsg(seriesErr.message);
        setLoading(false);
        return;
      }
      setChartData((series as Measurement[]) ?? []);

      // 2) Hent seneste målinger til cards (hent seneste 300 og find latest pr metric)
      const { data: recent, error: recentErr } = await supabase
        .from("measurements")
        .select("id, device_id, ts, metric, value, unit")
        .order("ts", { ascending: false })
        .limit(300);

      if (recentErr) {
        setErrorMsg(recentErr.message);
        setLoading(false);
        return;
      }
      setLatestRows((recent as Measurement[]) ?? []);

      setLoading(false);
    }

    load();
  }, [router, selectedMetric]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const latestByMetric = useMemo(() => {
    const map = new Map<string, Measurement>();
    for (const row of latestRows) {
      if (!map.has(row.metric)) map.set(row.metric, row);
    }
    return map;
  }, [latestRows]);

  const selectedUnit = useMemo(() => {
    const any = chartData.find((x) => x.unit != null)?.unit;
    return any ?? METRICS.find((m) => m.key === selectedMetric)?.unitHint ?? "";
  }, [chartData, selectedMetric]);

const echartsOption = useMemo(() => {
  const x = chartData.map((m) => new Date(m.ts).toLocaleString());
  const y = chartData.map((m) => m.value);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => value.toFixed(1),
    },
    grid: { left: 45, right: 20, top: 30, bottom: 60 },
    xAxis: {
      type: "category",
      data: x,
      axisLabel: { rotate: 35 },
    },
    yAxis: {
      type: "value",
      name: selectedUnit,
      axisLabel: {
        formatter: (value: number) => value.toFixed(1),
      },
    },
    series: [
      {
        type: "line",
        data: y,
        smooth: true,
        symbol: "none",
        areaStyle: { opacity: 0.08 },
      },
    ],
  };
}, [chartData, selectedUnit]);


  const co2Latest = latestByMetric.get("co2")?.value;
  const co2Chip = typeof co2Latest === "number" ? co2Status(co2Latest) : null;

  return (
    <div className="wrap">
      <header className="topbar">
        <div>
          <div className="title">Kunde Dashboard</div>
          <div className="subtitle">Logget ind som: <b>{email}</b></div>
        </div>

        <div className="actions">
          <select
            className="select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button className="btn" onClick={logout}>Log ud</button>
        </div>
      </header>

      <main className="grid">
        <section className="cards">
          {METRICS.map((m) => {
            const row = latestByMetric.get(m.key);
            const value = row?.value;
            const unit = row?.unit ?? m.unitHint;
            return (
              <div key={m.key} className={`card ${selectedMetric === m.key ? "cardActive" : ""}`}>
                <div className="cardTop">
                  <div className="cardLabel">{m.label}</div>
                  {m.key === "co2" && co2Chip && (
                    <span className={`chip ${co2Chip.chip}`}>{co2Chip.text}</span>
                  )}
                </div>
                <div className="cardValue">
                  {typeof value === "number" ? formatValue(value) : "-"} <span className="cardUnit">{unit}</span>
                </div>
                <div className="cardMeta">
                  {row ? new Date(row.ts).toLocaleString() : "Ingen data endnu"}
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div className="panelTitle">
              {METRICS.find((m) => m.key === selectedMetric)?.label} over tid
            </div>
            <div className="panelSub">
              Viser op til 500 datapunkter
            </div>
          </div>

          {loading && <div className="muted">Loader…</div>}
          {errorMsg && <div className="error">Fejl: {errorMsg}</div>}

          {!loading && !errorMsg && (
            <div className="chart">
              <ReactECharts option={echartsOption} style={{ height: 360, width: "100%" }} />
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          background: radial-gradient(1200px 600px at 20% 0%, rgba(80,140,255,0.20), transparent 55%),
                      radial-gradient(900px 500px at 80% 20%, rgba(0,255,200,0.12), transparent 60%),
                      #0b0f18;
          color: #e8eefc;
          padding: 32px 18px 60px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        .topbar {
          max-width: 1100px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 18px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          backdrop-filter: blur(8px);
        }

        .title { font-size: 18px; font-weight: 700; letter-spacing: 0.2px; }
        .subtitle { font-size: 13px; opacity: 0.85; margin-top: 4px; }

        .actions { display: flex; align-items: center; gap: 10px; }
        .select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: #e8eefc;
          padding: 10px 12px;
          border-radius: 12px;
          outline: none;
        }
        .btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          color: #e8eefc;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
        }
        .btn:hover { background: rgba(255,255,255,0.12); }

        .grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .card {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 14px 14px 12px;
        }
        .cardActive {
          border-color: rgba(120,170,255,0.50);
          box-shadow: 0 0 0 1px rgba(120,170,255,0.18) inset;
        }
        .cardTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .cardLabel { font-size: 13px; opacity: 0.9; }
        .cardValue { font-size: 26px; font-weight: 800; letter-spacing: -0.3px; }
        .cardUnit { font-size: 14px; opacity: 0.75; font-weight: 600; margin-left: 6px; }
        .cardMeta { font-size: 12px; opacity: 0.70; margin-top: 6px; }

        .chip {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          white-space: nowrap;
        }
        .chipGood { border-color: rgba(0,255,160,0.35); }
        .chipOk { border-color: rgba(255,215,0,0.35); }
        .chipBad { border-color: rgba(255,90,90,0.40); }

        .panel {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 14px;
        }
        .panelHeader { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        .panelTitle { font-size: 14px; font-weight: 700; }
        .panelSub { font-size: 12px; opacity: 0.65; }

        .chart { margin-top: 10px; }
        .muted { opacity: 0.75; margin-top: 10px; }
        .error { color: #ffb4b4; margin-top: 10px; }

        @media (max-width: 900px) {
          .cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
