"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface IgAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  className?: string;
  avatarClassName?: string;
  fallbackClassName?: string;
  showStoryRing?: boolean;
}

const SIZE_MAP = {
  xs: "size-8",     // 32px
  sm: "size-10",    // 40px (common people, header)
  md: "size-14",    // 56px (tree person cards)
  lg: "size-20",    // 80px
  xl: "size-28",    // 112px (form preview)
  "2xl": "size-32", // 128px (dossier profile)
  custom: "",
};

export function IgAvatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  avatarClassName,
  fallbackClassName,
  showStoryRing = true,
}: IgAvatarProps) {
  const sizeClass = size !== "custom" ? SIZE_MAP[size] : "";

  return (
    <div
      className={cn(
        "rounded-full transition-all duration-200 shrink-0 inline-flex items-center justify-center",
        showStoryRing ? "p-[2.5px] bg-ig-gradient shadow-sm" : "",
        sizeClass,
        className
      )}
    >
      <Avatar
        className={cn(
          "size-full rounded-full border-2 border-background overflow-hidden bg-background",
          avatarClassName
        )}
      >
        {src ? (
          <AvatarImage
            src={src}
            alt={alt}
            className="size-full object-cover rounded-full"
          />
        ) : null}
        <AvatarFallback
          className={cn(
            "size-full rounded-full bg-ig-gradient text-white font-bold flex items-center justify-center select-none text-xs",
            fallbackClassName
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
