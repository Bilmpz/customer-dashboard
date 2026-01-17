"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const sendReset = async () => {
    setMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setMsg("Fejl: " + error.message);
    else setMsg("Tjek din mail for reset-link ✅");
  };

  return (
    <div style={{ maxWidth: 420, margin: "100px auto" }}>
      <h1>Glemt kodeord</h1>

      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      />

      <button onClick={sendReset} style={{ marginTop: 12, padding: 10 }}>
        Send reset-mail
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
