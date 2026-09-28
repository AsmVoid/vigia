import * as React from "react";

export interface BankInfo {
  id: string;
  name: string;
  code: string;
  color: string;
}

export const BANKS_LIST: BankInfo[] = [
  { id: "nubank", name: "Nubank", code: "260", color: "#820ad1" },
  { id: "itau", name: "Itaú", code: "341", color: "#ec7000" },
  { id: "bb", name: "Banco do Brasil", code: "001", color: "#fbf800" },
  { id: "bradesco", name: "Bradesco", code: "237", color: "#cc092f" },
  { id: "santander", name: "Santander", code: "033", color: "#ec0000" },
  { id: "caixa", name: "Caixa", code: "104", color: "#0066b3" },
  { id: "picpay", name: "PicPay", code: "380", color: "#11c76f" },
  { id: "inter", name: "Inter", code: "077", color: "#ff7a00" },
  { id: "mercadopago", name: "Mercado Pago", code: "323", color: "#009ee3" },
  { id: "pagbank", name: "PagBank", code: "290", color: "#00a868" },
  { id: "c6", name: "C6 Bank", code: "336", color: "#242424" },
  { id: "btg", name: "BTG Pactual", code: "208", color: "#001e62" },
  { id: "neon", name: "Neon", code: "735", color: "#00e5ff" },
  { id: "pan", name: "Banco Pan", code: "623", color: "#0085ca" },
  { id: "safra", name: "Banco Safra", code: "422", color: "#af8e4e" },
  { id: "sicoob", name: "Sicoob", code: "756", color: "#003641" },
  { id: "xp", name: "XP", code: "102", color: "#000000" },
  { id: "next", name: "Next", code: "237", color: "#00ff5f" },
  { id: "citibank", name: "Citibank", code: "745", color: "#003b70" },
  { id: "sicredi", name: "Sicredi", code: "748", color: "#006437" },
];

export function getBankInfo(bankIdOrName?: string | null): BankInfo | undefined {
  if (!bankIdOrName) return undefined;
  const q = bankIdOrName.toLowerCase().trim();
  return BANKS_LIST.find(
    (b) =>
      b.id === q ||
      b.name.toLowerCase() === q ||
      b.code === q ||
      q.includes(b.name.toLowerCase()) ||
      b.name.toLowerCase().includes(q)
  );
}

export function BankIcon({
  bank,
  className = "size-5",
}: {
  bank?: string | null;
  className?: string;
}) {
  const info = getBankInfo(bank);
  const id = info?.id || (bank ? bank.toLowerCase().trim() : "default");

  switch (id) {
    case "nubank":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#820ad1" />
          <path
            d="M9 22V10h3.2l5.4 8.5V10H21v12h-3.2l-5.4-8.5V22H9z"
            fill="#ffffff"
          />
        </svg>
      );

    case "itau":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#003399" />
          <path
            d="M5 14h22v13a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V14z"
            fill="#ec7000"
          />
          <text
            x="16"
            y="23"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            Itaú
          </text>
        </svg>
      );

    case "bb":
    case "banco do brasil":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#fbf800" />
          <path
            d="M8 8l7 7-7 7h5l4.5-4.5L20 22h5l-7-7 7-7h-5l-4.5 4.5L13 8H8z"
            fill="#003882"
          />
        </svg>
      );

    case "bradesco":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#cc092f" />
          <path
            d="M16 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-6 9.5c0-.8.7-1.5 1.5-1.5h9c.8 0 1.5.7 1.5 1.5V17c0 3.9-3.1 7-7 7s-7-3.1-7-7v-1.5zm3.5 1.5v.5a3.5 3.5 0 0 0 7 0V17h-7z"
            fill="#ffffff"
          />
        </svg>
      );

    case "santander":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#ec0000" />
          <path
            d="M16 7c-2 2-3 4-2 6 1 2 3 3 2 5s-2 3-3 4c3 0 6-2 6-5 0-2-2-3-1-5s3-3 3-5c-2 1-4 2-5 5z"
            fill="#ffffff"
          />
          <path
            d="M11 15c-1 1-1.5 2.5-1 3.5.5 1 2 1.5 1.5 2.5s-1.5 1.5-2 2c2 0 4-1 4-2.5 0-1-1-1.5-.5-2.5s2-1.5 2-2.5c-1.5.5-2.5 1-4 2z"
            fill="#ffffff"
          />
        </svg>
      );

    case "caixa":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#0066b3" />
          <path d="M8 8l7 8-7 8h4.5l4.5-5.5L18.5 24H23l-7-8 7-8h-4.5L14 13.5 9.5 8H8z" fill="#f37021" />
          <path d="M12 8l8 16h4L16 8h-4z" fill="#ffffff" />
        </svg>
      );

    case "picpay":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#11c76f" />
          <path
            d="M11 23V9h5.5a4.5 4.5 0 0 1 4.5 4.5c0 2.5-2 4.5-4.5 4.5H14v5h-3zm3-8h2.5a1.5 1.5 0 0 0 1.5-1.5c0-.8-.7-1.5-1.5-1.5H14v3z"
            fill="#ffffff"
          />
        </svg>
      );

    case "inter":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#ff7a00" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-0.5"
          >
            inter
          </text>
        </svg>
      );

    case "mercadopago":
    case "mercado pago":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#009ee3" />
          <path
            d="M7 16c2-4 6-5 9-2l2 2c2 2 5 2 7 0M10 20c2 2 5 2 7 0l2-2c3-3 6-2 6 0"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "pagbank":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#00a868" />
          <path
            d="M10 23V9h6a4.5 4.5 0 0 1 4.5 4.5c0 2.5-2 4.5-4.5 4.5H13v5h-3zm3-8h3a1.5 1.5 0 0 0 1.5-1.5c0-.8-.7-1.5-1.5-1.5H13v3z"
            fill="#f9d000"
          />
        </svg>
      );

    case "c6":
    case "c6 bank":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#242424" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            C6
          </text>
        </svg>
      );

    case "btg":
    case "btg pactual":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#001e62" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-0.3"
          >
            BTG
          </text>
        </svg>
      );

    case "neon":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#00e5ff" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#001a33"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-0.5"
          >
            neon
          </text>
        </svg>
      );

    case "pan":
    case "banco pan":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#0085ca" />
          <circle cx="16" cy="16" r="11" fill="#ffffff" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="#0085ca"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            PAN
          </text>
        </svg>
      );

    case "safra":
    case "banco safra":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#131e3a" />
          <path
            d="M16 6l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10v-6l7-4z"
            fill="#af8e4e"
          />
          <text
            x="16"
            y="19"
            textAnchor="middle"
            fill="#131e3a"
            fontSize="8"
            fontWeight="900"
          >
            S
          </text>
        </svg>
      );

    case "sicoob":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#003641" />
          <circle cx="16" cy="16" r="4" fill="#00ae9d" />
          <circle cx="16" cy="10" r="3" fill="#78be20" />
          <circle cx="16" cy="22" r="3" fill="#00ae9d" />
          <circle cx="10" cy="16" r="3" fill="#78be20" />
          <circle cx="22" cy="16" r="3" fill="#78be20" />
        </svg>
      );

    case "xp":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#000000" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="12"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            XP
          </text>
        </svg>
      );

    case "next":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#000000" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#00ff5f"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            next
          </text>
        </svg>
      );

    case "citibank":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#003b70" />
          <path
            d="M12 9c3-2 6-2 9 0"
            stroke="#ed1c24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            citi
          </text>
        </svg>
      );

    case "sicredi":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#006437" />
          <path
            d="M16 9l4 4-4 4-4-4 4-4zm-5 7l4 4-4 4-4-4 4-4zm10 0l4 4-4 4-4-4 4-4z"
            fill="#ffffff"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <rect width="32" height="32" rx="7" fill="#334155" />
          <path
            d="M7 13l9-6 9 6v2H7v-2zm2 4h2v6H9v-6zm5 0h2v6h-2v-6zm5 0h2v6h-2v-6zM6 25h20v2H6v-2z"
            fill="#ffffff"
          />
        </svg>
      );
  }
}
