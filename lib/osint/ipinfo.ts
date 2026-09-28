export interface IpInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string; // "latitude,longitude"
  org?: string; // ASN + Provider name
  postal?: string;
  timezone?: string;
}

/**
 * Consulta de geolocalização e ASN de IP via IPInfo API limpa.
 */
export async function fetchIpInfo(
  ip?: string
): Promise<IpInfoResponse | null> {
  try {
    const token = process.env.IPINFO_TOKEN;
    const url = ip && ip !== "127.0.0.1" && ip !== "::1"
      ? `https://ipinfo.io/${encodeURIComponent(ip)}/json${token ? `?token=${token}` : ""}`
      : `https://ipinfo.io/json${token ? `?token=${token}` : ""}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VIGIA-OSINT-Platform/1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data: IpInfoResponse = await res.json();
    return data;
  } catch (error) {
    console.error("[IPInfo OSINT] Erro ao consultar IP:", error);
    return null;
  }
}
