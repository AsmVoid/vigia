export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  descricao_situacao_cadastral?: string;
  data_situacao_cadastral?: string;
  capital_social?: number;
  natureza_juridica?: string;
  porte?: string;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string;
  qsa?: Array<{
    nome_socio: string;
    qualificacao_socio: string;
    faixa_etaria?: string;
  }>;
}

/**
 * Consulta dados cadastrais oficiais e públicos de CNPJ via BrasilAPI (sem scraping).
 */
export async function fetchCnpjData(
  cnpj: string
): Promise<BrasilApiCnpjResponse | null> {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) {
    return null;
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VIGIA-OSINT-Platform/1.0",
      },
      next: { revalidate: 86400 }, // Cache 24h
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[BrasilAPI CNPJ] HTTP ${res.status} para CNPJ ${cleanCnpj}`);
      return null;
    }

    const data: BrasilApiCnpjResponse = await res.json();
    return data;
  } catch (error) {
    console.error("[BrasilAPI CNPJ] Erro ao consultar CNPJ:", error);
    return null;
  }
}
