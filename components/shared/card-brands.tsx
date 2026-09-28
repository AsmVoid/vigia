import * as React from "react";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "elo"
  | "amex"
  | "hipercard"
  | "alelo"
  | "sodexo";

export type CardGradientColor =
  | "vermelho"
  | "laranja"
  | "amarelo"
  | "verde"
  | "azul"
  | "anil"
  | "violeta";

export interface CardGradientOption {
  id: CardGradientColor;
  label: string;
  cssGradient: string;
  tailwindClass: string;
  accentColor: string;
}

export const CARD_GRADIENTS: CardGradientOption[] = [
  {
    id: "vermelho",
    label: "Vermelho",
    cssGradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #450a0a 100%)",
    tailwindClass: "from-red-600 via-rose-700 to-red-950",
    accentColor: "#ef4444",
  },
  {
    id: "laranja",
    label: "Laranja",
    cssGradient: "linear-gradient(135deg, #f97316 0%, #d97706 50%, #431407 100%)",
    tailwindClass: "from-orange-500 via-amber-600 to-orange-950",
    accentColor: "#f97316",
  },
  {
    id: "amarelo",
    label: "Amarelo",
    cssGradient: "linear-gradient(135deg, #fbbf24 0%, #ca8a04 50%, #422006 100%)",
    tailwindClass: "from-amber-400 via-yellow-600 to-yellow-950",
    accentColor: "#fbbf24",
  },
  {
    id: "verde",
    label: "Verde",
    cssGradient: "linear-gradient(135deg, #10b981 0%, #15803d 50%, #022c22 100%)",
    tailwindClass: "from-emerald-500 via-green-700 to-emerald-950",
    accentColor: "#10b981",
  },
  {
    id: "azul",
    label: "Azul",
    cssGradient: "linear-gradient(135deg, #38bdf8 0%, #2563eb 50%, #172554 100%)",
    tailwindClass: "from-sky-400 via-blue-600 to-blue-950",
    accentColor: "#38bdf8",
  },
  {
    id: "anil",
    label: "Anil",
    cssGradient: "linear-gradient(135deg, #818cf8 0%, #4f46e5 50%, #0f172a 100%)",
    tailwindClass: "from-indigo-400 via-indigo-600 to-slate-950",
    accentColor: "#818cf8",
  },
  {
    id: "violeta",
    label: "Violeta",
    cssGradient: "linear-gradient(135deg, #c084fc 0%, #7c3aed 50%, #3b0764 100%)",
    tailwindClass: "from-purple-400 via-violet-700 to-purple-950",
    accentColor: "#c084fc",
  },
];

export const CARD_BRANDS: { id: CardBrand; label: string }[] = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "elo", label: "Elo" },
  { id: "amex", label: "American Express" },
  { id: "hipercard", label: "Hipercard" },
  { id: "alelo", label: "Alelo" },
  { id: "sodexo", label: "Sodexo" },
];

export function CardBrandLogo({
  brand,
  className = "h-7 w-auto",
}: {
  brand?: string | null;
  className?: string;
}) {
  const b = (brand || "visa").toLowerCase().trim();

  switch (b) {
    case "visa":
      return (
        <svg viewBox="0 0 64 24" fill="none" className={className}>
          <text
            x="32"
            y="18"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="20"
            fontWeight="900"
            fontFamily="sans-serif"
            fontStyle="italic"
            letterSpacing="1"
          >
            VISA
          </text>
        </svg>
      );

    case "mastercard":
      return (
        <svg viewBox="0 0 48 30" fill="none" className={className}>
          <circle cx="17" cy="15" r="12" fill="#eb001b" />
          <circle cx="31" cy="15" r="12" fill="#f79e1b" fillOpacity="0.9" />
        </svg>
      );

    case "elo":
      return (
        <svg viewBox="0 0 76 28" fill="none" className={className}>
          <circle cx="14" cy="14" r="11" fill="#000000" />
          <path d="M8 14a6 6 0 0 1 6-6" stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M14 8a6 6 0 0 1 6 6" stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M20 14a6 6 0 0 1-6 6" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
          <text
            x="31"
            y="20"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.5"
          >
            elo
          </text>
        </svg>
      );

    case "amex":
    case "american express":
      return (
        <svg viewBox="0 0 60 26" fill="none" className={className}>
          <rect width="60" height="26" rx="4" fill="#007bc1" />
          <text
            x="30"
            y="17"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            AMEX
          </text>
        </svg>
      );

    case "hipercard":
      return (
        <svg viewBox="0 0 64 26" fill="none" className={className}>
          <rect width="64" height="26" rx="5" fill="#b91c1c" />
          <text
            x="32"
            y="17"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            fontStyle="italic"
          >
            Hipercard
          </text>
        </svg>
      );

    case "alelo":
      return (
        <svg viewBox="0 0 54 26" fill="none" className={className}>
          <rect width="54" height="26" rx="5" fill="#d97706" />
          <circle cx="14" cy="13" r="6" fill="#15803d" />
          <text
            x="34"
            y="17"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            alelo
          </text>
        </svg>
      );

    case "sodexo":
      return (
        <svg viewBox="0 0 64 26" fill="none" className={className}>
          <rect width="64" height="26" rx="5" fill="#1e3a8a" />
          <path d="M12 9l3 8h4l-3-8h-4z" fill="#dc2626" />
          <text
            x="38"
            y="17"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            sodexo
          </text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 24" fill="none" className={className}>
          <text
            x="32"
            y="18"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            CARD
          </text>
        </svg>
      );
  }
}
