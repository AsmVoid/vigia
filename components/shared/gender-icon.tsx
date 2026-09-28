import * as React from "react";
import { cn } from "@/lib/utils";

export interface GenderIconProps extends React.SVGProps<SVGSVGElement> {
  gender: string | null | undefined;
  className?: string;
  useBrandColor?: boolean;
}

export function GenderIcon({
  gender,
  className,
  useBrandColor = false,
  ...props
}: GenderIconProps) {
  if (!gender) return null;

  const normalized = gender.toUpperCase().trim();

  if (normalized === "MALE" || normalized === "MASCULINO" || normalized === "M") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "inline-block shrink-0",
          useBrandColor ? "text-sky-500 dark:text-sky-400" : "",
          className
        )}
        aria-label="Masculino"
        role="img"
        {...props}
      >
        {/* Circle with arrow pointing top-right */}
        <circle cx="10" cy="14" r="5" />
        <path d="M13.5 10.5L20 4" />
        <path d="M15 4h5v5" />
      </svg>
    );
  }

  if (normalized === "FEMALE" || normalized === "FEMININO" || normalized === "F") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "inline-block shrink-0",
          useBrandColor ? "text-rose-500 dark:text-rose-400" : "",
          className
        )}
        aria-label="Feminino"
        role="img"
        {...props}
      >
        {/* Circle with downward cross */}
        <circle cx="12" cy="9.5" r="5" />
        <path d="M12 14.5v6" />
        <path d="M9 18h6" />
      </svg>
    );
  }

  // OTHER / OUTRO / NON-BINARY
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "inline-block shrink-0",
        useBrandColor ? "text-purple-500 dark:text-purple-400" : "",
        className
      )}
      aria-label="Outro"
      role="img"
      {...props}
    >
      <circle cx="12" cy="11" r="5" />
      <path d="M12 16v5" />
      <path d="M9.5 19h5" />
      <path d="M12 6V2" />
      <path d="M9.5 3.5l5 0" />
    </svg>
  );
}
