"use client";

import { useEffect, useRef, useState } from "react";

export default function MetricSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} style={s.wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={s.btn}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={s.dot} />
          <span style={s.btnText}>{current.label}</span>
        </div>
        <span style={{ opacity: 0.85 }}>▾</span>
      </button>

      {open && (
        <div style={s.menu}>
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  ...s.item,
                  ...(active ? s.itemActive : {}),
                }}
              >
                <span style={s.itemLeft}>
                  <span style={{ ...s.itemLabel, ...(active ? s.itemLabelActive : {}) }}>
                    {o.label}
                  </span>
                  <span style={s.itemMeta}>{o.meta}</span>
                </span>

                {active && <span style={s.check}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { position: "relative", width: 220 },
  btn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  btnText: { fontWeight: 800, letterSpacing: "-0.01em" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(59,130,246,0.95)",
    boxShadow: "0 0 0 4px rgba(59,130,246,0.18)",
  },

  menu: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(10, 16, 26, 0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",
    zIndex: 9999,
  },
  item: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
  },
  itemActive: { background: "rgba(59,130,246,0.14)" },

  itemLeft: { display: "flex", alignItems: "baseline", gap: 10 },
  itemLabel: { fontWeight: 800, opacity: 0.9 },
  itemLabelActive: { opacity: 1 },
  itemMeta: { fontSize: 12, opacity: 0.65 },
  check: { fontWeight: 900, opacity: 0.9 },
};
