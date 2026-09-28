import * as React from "react";
import { cn } from "@/lib/utils";

export interface ZodiacIconProps extends React.SVGProps<SVGSVGElement> {
  sign: string;
  className?: string;
  useGradient?: boolean;
}

// Clean astrological vector paths on a 24x24 grid (stroke width 2, linecap round, linejoin round)
const ZODIAC_PATHS: Record<string, React.ReactNode> = {
  aries: (
    <>
      <path d="M12 21V8" />
      <path d="M12 8c0-3.5-2.5-5-5-5S3 4.5 3 7.5s1.5 4 4 4" />
      <path d="M12 8c0-3.5 2.5-5 5-5s4 1.5 4 4.5-1.5 4-4 4" />
    </>
  ),
  taurus: (
    <>
      <circle cx="12" cy="14.5" r="5" />
      <path d="M5.5 4.5C7 8 9.5 9.5 12 9.5s5-1.5 6.5-5" />
    </>
  ),
  gemini: (
    <>
      <path d="M4 4.5c4 2.5 12 2.5 16 0" />
      <path d="M4 19.5c4-2.5 12-2.5 16 0" />
      <path d="M9 6v12" />
      <path d="M15 6v12" />
    </>
  ),
  cancer: (
    <>
      <circle cx="7" cy="8" r="3" />
      <path d="M7 5c5 0 10.5 2.5 11.5 7" />
      <circle cx="17" cy="16" r="3" />
      <path d="M17 19c-5 0-10.5-2.5-11.5-7" />
    </>
  ),
  leo: (
    <>
      <circle cx="7" cy="15.5" r="3" />
      <path d="M9.5 14C10.5 8 13.5 4 17 4c2.5 0 3.5 1.8 3.5 4s-1.5 4.5-3 8.5c-.8 2.2-.2 3.5 1 3.5" />
    </>
  ),
  virgo: (
    <>
      {/* 3 arches of 'm' with loop + crossing tail */}
      <path d="M4 19.5V9c0-2.2 1.5-3.5 3.5-3.5S11 6.8 11 9v10.5" />
      <path d="M11 9c0-2.2 1.5-3.5 3.5-3.5S18 6.8 18 9v8.5c0 2.5 1.5 4 3 2.5" />
      <path d="M15 15.5l5 4.5" />
    </>
  ),
  libra: (
    <>
      <path d="M4 14h4.5a3.5 3.5 0 0 1 7 0H20" />
      <path d="M4 19h16" />
    </>
  ),
  scorpio: (
    <>
      {/* 3 arches of 'm' with arrow tail */}
      <path d="M4 19.5V9c0-2.2 1.5-3.5 3.5-3.5S11 6.8 11 9v10.5" />
      <path d="M11 9c0-2.2 1.5-3.5 3.5-3.5S18 6.8 18 9v6.5c0 2 1.5 3.5 3.5 3.5H22" />
      <path d="M19 16.5l3 2.5-3 2.5" />
    </>
  ),
  sagittarius: (
    <>
      <path d="M5 19L19 5" />
      <path d="M13 5h6v6" />
      <path d="M9 12l3 3" />
    </>
  ),
  capricorn: (
    <>
      <path d="M4 6.5c0-1.7 1.5-2.5 3-2.5s3 1 3 3v10.5c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5V11c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5c0 3.5-2.5 6.5-4.5 8" />
    </>
  ),
  aquarius: (
    <>
      <path d="M3.5 8.5l3-3 3 3 3-3 3 3 3-3 3 3" />
      <path d="M3.5 15.5l3-3 3 3 3-3 3 3 3-3 3 3" />
    </>
  ),
  pisces: (
    <>
      <path d="M6 4c3.5 4.5 3.5 11.5 0 16" />
      <path d="M18 4c-3.5 4.5-3.5 11.5 0 16" />
      <path d="M4 12h16" />
    </>
  ),
};

// Map portuguese & english names / variations to normalized key
function normalizeSignKey(raw: string): string {
  if (!raw) return "virgo";
  const s = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (s.includes("arie")) return "aries";
  if (s.includes("tour") || s.includes("taur")) return "taurus";
  if (s.includes("geme") || s.includes("gemi")) return "gemini";
  if (s.includes("canc")) return "cancer";
  if (s.includes("lea") || s.includes("leo")) return "leo";
  if (s.includes("virg")) return "virgo";
  if (s.includes("libr")) return "libra";
  if (s.includes("escor") || s.includes("scorp")) return "scorpio";
  if (s.includes("sagit")) return "sagittarius";
  if (s.includes("capric")) return "capricorn";
  if (s.includes("aqua")) return "aquarius";
  if (s.includes("peix") || s.includes("pisc")) return "pisces";

  return "virgo";
}

export function ZodiacIcon({
  sign,
  className,
  useGradient = true,
  ...props
}: ZodiacIconProps) {
  const normalizedKey = normalizeSignKey(sign);
  const pathContent = ZODIAC_PATHS[normalizedKey] || ZODIAC_PATHS.virgo;
  const gradientId = React.useId();

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={useGradient ? `url(#${gradientId})` : "currentColor"}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block shrink-0", className)}
      aria-label={`Signo ${sign}`}
      role="img"
      {...props}
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#833ab4" />
            <stop offset="50%" stopColor="#fd1d1d" />
            <stop offset="100%" stopColor="#fcb045" />
          </linearGradient>
        </defs>
      )}
      {pathContent}
    </svg>
  );
}
