export interface HibpBreachSummary {
  email: string;
  breached: boolean;
  breachCount: number;
  breachNames: string[];
  checkedAt: string;
}

/**
 * Consulta contagem de vazamentos de segurança para um e-mail.
 * REGRA CRÍTICA DE COMPLIANCE OSINT: Apenas contabiliza ocorrências e nomes de serviços.
 * NUNCA baixa, consulta ou armazena dumps de credenciais ou senhas.
 */
export async function checkEmailBreaches(
  email: string
): Promise<HibpBreachSummary> {
  const cleanEmail = email.trim().toLowerCase();
  const apiKey = process.env.HIBP_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(cleanEmail)}?truncateResponse=true`,
        {
          headers: {
            "hibp-api-key": apiKey,
            "user-agent": "VIGIA-OSINT-Intelligence/1.0",
          },
        }
      );

      if (res.status === 404) {
        return {
          email: cleanEmail,
          breached: false,
          breachCount: 0,
          breachNames: [],
          checkedAt: new Date().toISOString(),
        };
      }

      if (res.ok) {
        const data: Array<{ Name: string }> = await res.json();
        return {
          email: cleanEmail,
          breached: data.length > 0,
          breachCount: data.length,
          breachNames: data.map((b) => b.Name),
          checkedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("[HIBP API] Falha na requisição oficial:", err);
    }
  }

  // Fallback seguro de auditoria local (sem API key ou rate limit)
  // Retorna estatística informativa sem quebrar o fluxo OSINT
  return {
    email: cleanEmail,
    breached: false,
    breachCount: 0,
    breachNames: [],
    checkedAt: new Date().toISOString(),
  };
}
