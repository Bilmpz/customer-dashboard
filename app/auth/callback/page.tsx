"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      // IMPORTANT: Bytter tokens i URL/hash til en rigtig session (cookies/localStorage)
      const { error } = await supabase.auth.getSession();

      if (error) {
        // hvis noget går galt, send til login
        router.replace("/login");
        return;
      }

      // send til dashboard
      router.replace("/");
    }

    finishLogin();
  }, [router]);

  return <p style={{ padding: 20, fontFamily: "system-ui" }}>Logger ind…</p>;
}
