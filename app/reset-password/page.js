"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
      if (!data.session) {
        setMsg(
          "Åbn reset-linket fra mailen igen. Hvis det stadig fejler, så send en ny reset-mail."
        );
      }
    };
    run();
  }, []);

  const updatePassword = async () => {
    setMsg("");

    if (password.length < 6) return setMsg("Kodeord skal være mindst 6 tegn.");
    if (password !== password2) return setMsg("Kodeord matcher ikke.");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) setMsg("Fejl: " + error.message);
    else setMsg("Kodeord opdateret ✅ Du kan nu logge ind.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "100px auto" }}>
      <h1>Nulstil kodeord</h1>

      <input
        type="password"
        placeholder="Nyt kodeord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
        disabled={!ready}
      />

      <input
        type="password"
        placeholder="Gentag nyt kodeord"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
        disabled={!ready}
      />

      <button
        onClick={updatePassword}
        style={{ marginTop: 12, padding: 10 }}
        disabled={!ready}
      >
        Opdater kodeord
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <p style={{ marginTop: 12 }}>
        <a href="/login">Tilbage til login</a>
      </p>
    </div>
  );
}
