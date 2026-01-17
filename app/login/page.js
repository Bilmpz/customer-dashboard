"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMsg("Login fejl: " + error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Login</h1>
          <p style={styles.subtitle}>Log ind for at fortsætte</p>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="oliver@eksempel.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {msg && (
          <div style={styles.errorBox}>
            <span style={styles.errorTitle}>Ups…</span>
            <span style={styles.errorText}>{msg}</span>
          </div>
        )}

        <button
          type="button"
          onClick={login}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? "Logger ind..." : "Log ind"}
        </button>

        <div style={styles.footer}>
          <Link href="/forgot-password" style={styles.link}>
            Glemt kodeord?
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 50% 0%, rgba(99,102,241,0.25), transparent 60%), #0b0f19",
    color: "#e5e7eb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    background: "rgba(17, 24, 39, 0.75)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  header: { marginBottom: 16 },
  title: { margin: 0, fontSize: 26, letterSpacing: "-0.02em" },
  subtitle: { margin: "6px 0 0", color: "rgba(229,231,235,0.7)", fontSize: 14 },

  field: { display: "grid", gap: 8, marginTop: 14 },
  label: { fontSize: 13, color: "rgba(229,231,235,0.8)" },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#e5e7eb",
    outline: "none",
  },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    display: "grid",
    gap: 4,
  },
  errorTitle: { fontWeight: 700, fontSize: 13, color: "rgba(239,68,68,0.95)" },
  errorText: { fontSize: 13, color: "rgba(229,231,235,0.9)" },

  button: {
    marginTop: 14,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(99,102,241,0.95), rgba(79,70,229,0.95))",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  footer: {
    marginTop: 14,
    display: "flex",
    justifyContent: "center",
  },
  link: {
    color: "rgba(229,231,235,0.8)",
    textDecoration: "none",
    fontSize: 13,
  },
};
