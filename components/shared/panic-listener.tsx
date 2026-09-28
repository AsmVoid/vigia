"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function PanicListener() {
  React.useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Atalho Global: Ctrl + Shift + Esc
      if (e.ctrlKey && e.shiftKey && (e.key === "Escape" || e.code === "Escape")) {
        e.preventDefault();
        e.stopPropagation();

        console.warn("[PANIC PROTOCOL ACTIVATED]");
        toast.error("🚨 PROTOCOLO DE PÂNICO: Destruindo dados de sessão...");

        try {
          if (typeof window !== "undefined") {
            // Limpa todos os armazenamentos locais e de sessão
            localStorage.clear();
            sessionStorage.clear();
          }

          // Invalida sessão no Better Auth
          await authClient.signOut();
        } catch (err) {
          console.error("Erro durante encerramento de pânico:", err);
        } finally {
          // Redireciona com flag informativa
          window.location.href = "/login?panic=true";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  return null;
}
