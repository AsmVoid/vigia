/**
 * Utilitários para tratamento de endereços e links do Google Maps (Tipo 1 e Tipo 2)
 */

export function extractAddressMaps(complement?: string | null): {
  cleanComplement: string;
  mapsUrl: string | null;
} {
  if (!complement) return { cleanComplement: "", mapsUrl: null };
  
  // Verifica se possui a tag serializada [maps:URL]
  const match = complement.match(/\[maps:(https?:\/\/[^\]]+)\]/);
  if (match) {
    const mapsUrl = match[1];
    const cleanComplement = complement.replace(/\[maps:https?:\/\/[^\]]+\]/, "").trim();
    return { cleanComplement, mapsUrl };
  }

  // Verifica se o próprio complemento é um link do Maps
  if (/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com|www\.google\.com\/maps)/i.test(complement.trim())) {
    return { cleanComplement: "", mapsUrl: complement.trim() };
  }

  return { cleanComplement: complement, mapsUrl: null };
}

export function packAddressComplement(
  cleanComplement?: string | null,
  mapsUrl?: string | null
): string | null {
  const c = (cleanComplement || "").trim();
  const m = (mapsUrl || "").trim();

  if (m) {
    // Normaliza URL se não começar com http
    const normalizedUrl = /^https?:\/\//i.test(m) ? m : `https://${m}`;
    return c ? `${c} [maps:${normalizedUrl}]` : `[maps:${normalizedUrl}]`;
  }

  return c || null;
}
