import * as React from "react";

export type CryptoSymbol =
  | "BTC"
  | "ETH"
  | "SOL"
  | "BNB"
  | "XRP"
  | "USDT"
  | "USDC"
  | "XMR"
  | "BCH";

export interface CryptoInfo {
  symbol: CryptoSymbol;
  name: string;
  color: string;
}

export const CRYPTO_LIST: CryptoInfo[] = [
  { symbol: "BTC", name: "Bitcoin", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", color: "#627eea" },
  { symbol: "SOL", name: "Solana", color: "#14f195" },
  { symbol: "BNB", name: "BNB (Binance)", color: "#f3ba2f" },
  { symbol: "XRP", name: "XRP (Ripple)", color: "#23292f" },
  { symbol: "USDT", name: "Tether USD", color: "#26a17b" },
  { symbol: "USDC", name: "USD Coin", color: "#2775ca" },
  { symbol: "XMR", name: "Monero", color: "#ff6600" },
  { symbol: "BCH", name: "Bitcoin Cash", color: "#0ac18e" },
];

// Ícone Oficial de Chave PIX (combinação da chave de segurança com o símbolo do Banco Central PIX)
export function PixKeyIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Halo brilhante de fundo */}
      <circle cx="12" cy="12" r="10" fill="#32bcad" fillOpacity="0.15" />
      {/* Anel da chave com detalhe de diamante PIX */}
      <circle cx="8.5" cy="12" r="4.5" stroke="#32bcad" strokeWidth="2" />
      <path
        d="M8.5 9.5l1.5 2.5-1.5 2.5-1.5-2.5 1.5-2.5z"
        fill="#32bcad"
      />
      {/* Haste e dentes da chave */}
      <path
        d="M13 12h7M17 12v3M19.5 12v2"
        stroke="#32bcad"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Logo Oficial PIX do Banco Central
export function PixLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5.2 6.8l4.3 4.3c.5.5.5 1.3 0 1.8L5.2 17.2c-.6.6-1.5.1-1.5-.7V7.5c0-.8.9-1.3 1.5-.7z"
        fill="#32bcad"
      />
      <path
        d="M18.8 6.8l-4.3 4.3c-.5.5-.5 1.3 0 1.8l4.3 4.3c.6.6 1.5.1 1.5-.7V7.5c0-.8-.9-1.3-1.5-.7z"
        fill="#32bcad"
      />
      <path
        d="M12 4.2l3 3c.4.4.4 1 0 1.4l-2.3 2.3c-.4.4-1 .4-1.4 0L9 8.6c-.4-.4-.4-1 0-1.4l3-3c.4-.4 1-.4 1.4 0z"
        fill="#00bdae"
      />
      <path
        d="M12 19.8l-3-3c-.4-.4-.4-1 0-1.4l2.3-2.3c.4-.4 1-.4 1.4 0l2.3 2.3c.4.4.4 1 0 1.4l-3 3c-.4.4-1 .4-1.4 0z"
        fill="#00bdae"
      />
    </svg>
  );
}

// Componente com SVGs oficiais das 9 Criptomoedas solicitadas
export function CryptoIcon({
  symbol,
  className = "size-6",
}: {
  symbol?: string | null;
  className?: string;
}) {
  const s = (symbol || "").toUpperCase().trim();

  switch (s) {
    case "BTC":
    case "BITCOIN":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.258l.002-.007-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.53-.794.408.017.025-1.256-.314-1.256-.314l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.705 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.535 2.146-4.148.986-5.32.695l.95-3.805c1.17.292 4.929.872 4.37 3.11zm.535-5.569c-.488 1.954-3.497.962-4.474.718l.86-3.45c.977.244 4.126.699 3.614 2.732z"
            fill="#ffffff"
          />
        </svg>
      );

    case "ETH":
    case "ETHEREUM":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path
            d="M16.498 4v8.87l7.497 3.35z"
            fill="#ffffff"
            fillOpacity="0.6"
          />
          <path d="M16.498 4L9 16.22l7.498-3.35z" fill="#ffffff" />
          <path
            d="M16.498 21.968v6.027L24 17.616z"
            fill="#ffffff"
            fillOpacity="0.6"
          />
          <path d="M16.498 27.995v-6.027L9 17.616z" fill="#ffffff" />
          <path
            d="M16.498 20.573l7.497-4.353-7.497-3.348z"
            fill="#ffffff"
            fillOpacity="0.2"
          />
          <path
            d="M9 16.22l7.498 4.353v-7.701z"
            fill="#ffffff"
            fillOpacity="0.6"
          />
        </svg>
      );

    case "SOL":
    case "SOLANA":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <defs>
            <linearGradient id="sol-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
            <linearGradient id="sol-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
            <linearGradient id="sol-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <path
            d="M8.5 21.6l2.3-2.3c.3-.3.7-.4 1.1-.4h11.6c.7 0 1.1.8.6 1.3l-2.3 2.3c-.3.3-.7.4-1.1.4H9.1c-.7 0-1.1-.8-.6-1.3z"
            fill="url(#sol-grad-1)"
          />
          <path
            d="M8.5 10.4l2.3-2.3c.3-.3.7-.4 1.1-.4h11.6c.7 0 1.1.8.6 1.3l-2.3 2.3c-.3.3-.7.4-1.1.4H9.1c-.7 0-1.1-.8-.6-1.3z"
            fill="url(#sol-grad-2)"
          />
          <path
            d="M23.5 16l-2.3 2.3c-.3.3-.7.4-1.1.4H8.5c-.7 0-1.1-.8-.6-1.3l2.3-2.3c.3-.3.7-.4 1.1-.4h11.6c.7 0 1.1.8.6 1.3z"
            fill="url(#sol-grad-3)"
          />
        </svg>
      );

    case "BNB":
    case "BINANCE":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path
            d="M16 7l3.6 3.6-1.8 1.8L16 10.6l-1.8 1.8-1.8-1.8L16 7zm-5.4 5.4l1.8 1.8-1.8 1.8-1.8-1.8 1.8-1.8zm10.8 0l1.8 1.8-1.8 1.8-1.8-1.8 1.8-1.8zM16 13.8l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm-7.6 2.2l1.8 1.8-3.6 3.6-1.8-1.8 3.6-3.6zm15.2 0l3.6 3.6-1.8 1.8-3.6-3.6 1.8-1.8zM16 19.8l1.8 1.8-1.8 1.8-1.8-1.8 1.8-1.8zm-5.4 1.8l1.8 1.8-1.8 1.8-1.8-1.8 1.8-1.8zm10.8 0l1.8 1.8-1.8 1.8-1.8-1.8 1.8-1.8zM16 23.4l1.8 1.8L16 27l-3.6-3.6 1.8-1.8L16 23.4z"
            fill="#ffffff"
          />
        </svg>
      );

    case "XRP":
    case "RIPPLE":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#23292F" />
          <path
            d="M24.2 9h-2.5c-.5 0-.9.2-1.2.6L16 14.1l-4.5-4.5c-.3-.4-.7-.6-1.2-.6H7.8c-.4 0-.7.4-.5.8l6.3 6.3c.7.7 1.9.7 2.6 0l6.3-6.3c.4-.4.1-.8-.3-.8z"
            fill="#ffffff"
          />
          <path
            d="M7.8 23h2.5c.5 0 .9-.2 1.2-.6l4.5-4.5 4.5 4.5c.3.4.7.6 1.2.6h2.5c.4 0 .7-.4.5-.8l-6.3-6.3c-.7-.7-1.9-.7-2.6 0L7.5 22.2c-.4.4-.1.8.3.8z"
            fill="#ffffff"
          />
        </svg>
      );

    case "USDT":
    case "TETHER":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            d="M17.9 14.7v-2.2h5.3V9.5H8.8v3h5.3v2.2c-4.4.2-7.7 1.1-7.7 2.2 0 1.1 3.3 2 7.7 2.2v6.4h3.8v-6.4c4.4-.2 7.7-1.1 7.7-2.2 0-1.1-3.3-2-7.7-2.2zm0 3.1v-.1c-1 .1-2.4.1-3.8.1-1.3 0-2.6 0-3.6-.1v.1c-3.1-.2-5.4-.7-5.4-1.4 0-.7 2.3-1.2 5.4-1.4v2.2c1.1.1 2.4.1 3.7.1 1.4 0 2.7 0 3.7-.1v-2.2c3.1.2 5.4.7 5.4 1.4 0 .7-2.3 1.2-5.4 1.4z"
            fill="#ffffff"
          />
        </svg>
      );

    case "USDC":
    case "USD COIN":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#2775CA" />
          <path
            d="M16 6a10 10 0 1 0 10 10A10 10 0 0 0 16 6zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
            fill="#ffffff"
            fillOpacity="0.4"
          />
          <path
            d="M16.8 11.2a3.8 3.8 0 0 0-2.4.8l.9 1.5a2.2 2.2 0 0 1 1.5-.6c.9 0 1.4.5 1.4 1.1 0 .6-.4.9-1.5 1.2-1.9.5-3 .9-3 2.5 0 1.6 1.2 2.7 2.8 2.9v1.2h1.6v-1.2a4.4 4.4 0 0 0 2.8-1l-.9-1.6a2.6 2.6 0 0 1-1.9.8c-1 0-1.5-.5-1.5-1.1 0-.6.4-.9 1.6-1.3 1.9-.5 2.9-1.1 2.9-2.5 0-1.5-1.2-2.6-2.6-2.8v-1.1h-1.6v1.1z"
            fill="#ffffff"
          />
        </svg>
      );

    case "XMR":
    case "MONERO":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#FF6600" />
          {/* Metade inferior escura */}
          <path
            d="M32 16A16 16 0 0 1 5 25.5l3.2-3.2v-7.8l5.8 5.8a3 3 0 0 0 4 0l5.8-5.8v7.8l3.2 3.2A16 16 0 0 0 32 16z"
            fill="#4C4C4C"
          />
          {/* Logo "M" Monero vazado */}
          <path
            d="M16 18.2l-5-5V22h-3v-9.5l7 7a1.4 1.4 0 0 0 2 0l7-7V22h-3v-8.8l-5 5z"
            fill="#ffffff"
          />
        </svg>
      );

    case "BCH":
    case "BITCOIN CASH":
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#0AC18E" />
          <path
            d="M22.5 13.5c.3-1.8-1.1-2.8-3-3.4l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.5c-.3-.1-.6-.2-1-.2L12 8.3l-.4 1.6s1.1.3 1.1.3c.6.2.7.6.7.9l-.7 2.8c0 .1.1.1.2.1h-.2l-1 3.9c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.7 1.7 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.5c2.6.5 4.5.3 5.3-2 .7-1.9 0-3-1.4-3.7 1-.2 1.7-.9 1.9-2.2zm-3.4 4.8c-.5 1.9-3.6.9-4.6.6l.8-3.3c1 .3 4.3.8 3.8 2.7zm.5-4.8c-.4 1.7-3 .8-3.9.6l.7-3c.9.2 3.6.6 3.2 2.4z"
            fill="#ffffff"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="16" fill="#38BDF8" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="2" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#38BDF8"
            fontSize="14"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ₿
          </text>
        </svg>
      );
  }
}

export function getCryptoInfo(query?: string | null): CryptoInfo | undefined {
  if (!query) return undefined;
  const q = query.trim().toUpperCase();
  return CRYPTO_LIST.find(
    (c) => c.symbol === q || c.name.toUpperCase() === q
  );
}
