"use client";

import * as React from "react";
import {
  siInstagram,
  siFacebook,
  siX,
  siThreads,
  siYoutube,
  siTiktok,
  siTwitch,
  siReddit,
  siDiscord,
  siWhatsapp,
  siTelegram,
  siPinterest,
  siGithub,
  siRoblox,
  siSpotify,
  siPlaystation,
  siSteam,
} from "simple-icons";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialBrand {
  name: string;
  slug: string;
  hex: string;
  path: string;
}

export const BLACK_BRANDS = new Set([
  "x",
  "twitter",
  "threads",
  "tiktok",
  "github",
  "roblox",
  "steam",
]);

// Map of all 20 required OSINT social networks
export const SOCIAL_BRANDS: Record<string, SocialBrand> = {
  website: {
    name: "Website / Site Pessoal",
    slug: "website",
    hex: "currentColor",
    path: "",
  },
  instagram: {
    name: "Instagram",
    slug: "instagram",
    hex: siInstagram.hex,
    path: siInstagram.path,
  },
  facebook: {
    name: "Facebook",
    slug: "facebook",
    hex: siFacebook.hex,
    path: siFacebook.path,
  },
  x: {
    name: "X (Twitter)",
    slug: "x",
    hex: "000000",
    path: siX.path,
  },
  twitter: {
    name: "X (Twitter)",
    slug: "x",
    hex: "000000",
    path: siX.path,
  },
  threads: {
    name: "Threads",
    slug: "threads",
    hex: "000000",
    path: siThreads.path,
  },
  youtube: {
    name: "YouTube",
    slug: "youtube",
    hex: siYoutube.hex,
    path: siYoutube.path,
  },
  tiktok: {
    name: "TikTok",
    slug: "tiktok",
    hex: "000000",
    path: siTiktok.path,
  },
  twitch: {
    name: "Twitch",
    slug: "twitch",
    hex: siTwitch.hex,
    path: siTwitch.path,
  },
  linkedin: {
    name: "LinkedIn",
    slug: "linkedin",
    hex: "0A66C2",
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.67 1.67 0 0 0-1.68 1.68c0 .93.75 1.69 1.68 1.69.93 0 1.69-.76 1.69-1.69 0-.93-.76-1.68-1.69-1.68Z",
  },
  reddit: {
    name: "Reddit",
    slug: "reddit",
    hex: siReddit.hex,
    path: siReddit.path,
  },
  discord: {
    name: "Discord",
    slug: "discord",
    hex: siDiscord.hex,
    path: siDiscord.path,
  },
  whatsapp: {
    name: "WhatsApp",
    slug: "whatsapp",
    hex: siWhatsapp.hex,
    path: siWhatsapp.path,
  },
  telegram: {
    name: "Telegram",
    slug: "telegram",
    hex: siTelegram.hex,
    path: siTelegram.path,
  },
  pinterest: {
    name: "Pinterest",
    slug: "pinterest",
    hex: siPinterest.hex,
    path: siPinterest.path,
  },
  github: {
    name: "GitHub",
    slug: "github",
    hex: siGithub.hex,
    path: siGithub.path,
  },
  roblox: {
    name: "Roblox",
    slug: "roblox",
    hex: "000000",
    path: siRoblox.path,
  },
  spotify: {
    name: "Spotify",
    slug: "spotify",
    hex: siSpotify.hex,
    path: siSpotify.path,
  },
  playstation: {
    name: "PlayStation",
    slug: "playstation",
    hex: siPlaystation.hex,
    path: siPlaystation.path,
  },
  xbox: {
    name: "Xbox",
    slug: "xbox",
    hex: "107C10",
    path: "M4.787 3.592c-1.31 1.25-2.28 2.87-2.76 4.67-.18.66-.28 1.35-.28 2.05 0 3.99 2.45 7.42 5.95 8.84-1.39-2.31-2.45-5.12-2.78-8.24 0-.15.34-2.88 2.22-5.42-.7-.66-1.51-1.3-2.35-1.9zm14.426 0c-.84.6-1.65 1.24-2.35 1.9 1.88 2.54 2.22 5.27 2.22 5.42-.33 3.12-1.39 5.93-2.78 8.24 3.5-1.42 5.95-4.85 5.95-8.84 0-.7-.1-1.39-.28-2.05-.48-1.8-1.45-3.42-2.76-4.67zm-7.213-.67c-1.87 0-3.6.49-5.1 1.35.8.71 1.7 1.39 2.65 2 1.38.89 2.82 1.55 4.28 1.97 1.46-.42 2.9-1.08 4.28-1.97.95-.61 1.85-1.29 2.65-2-1.5-.86-3.23-1.35-5.1-1.35zm-2.8 8.16c-1.74 3.5-3.08 7.02-3.88 10.45 1.94 1.05 4.19 1.66 6.58 1.66 2.39 0 4.64-.61 6.58-1.66-.8-3.43-2.14-6.95-3.88-10.45-1.44 1.15-2.92 1.85-4.4 1.85-1.48 0-2.96-.7-4.4-1.85z",
  },
  steam: {
    name: "Steam",
    slug: "steam",
    hex: "000000",
    path: siSteam.path,
  },
};

export function getSocialBrand(platform: string): SocialBrand | null {
  if (!platform) return null;
  const key = platform.toLowerCase().trim();
  return SOCIAL_BRANDS[key] || null;
}

interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  platform: string;
  className?: string;
  useBrandColor?: boolean;
}

export function SocialIcon({
  platform,
  className,
  useBrandColor = false,
  ...props
}: SocialIconProps) {
  const brand = getSocialBrand(platform);

  if (!brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("size-4 shrink-0 fill-current", className)}
        {...props}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (brand.slug === "website") {
    return (
      <Globe
        className={cn("size-4 shrink-0 text-foreground", className)}
        {...(props as any)}
      />
    );
  }

  const isBlack = BLACK_BRANDS.has(brand.slug);

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill={useBrandColor ? (isBlack ? "currentColor" : `#${brand.hex}`) : "currentColor"}
      className={cn(
        "size-4 shrink-0",
        useBrandColor && isBlack ? "fill-foreground text-foreground" : "",
        className
      )}
      {...props}
    >
      <title>{brand.name}</title>
      <path d={brand.path} />
    </svg>
  );
}

/**
 * Retorna a URL correta de redirecionamento para cada rede ou website pessoal.
 * Para 'website', nunca redireciona para 'website.com/{conteudo}', mas sim para a URL informada.
 */
export function formatSocialUrl(
  platform: string,
  username?: string | null,
  url?: string | null
): string {
  const normPlatform = (platform || "").toLowerCase().trim();
  const rawUrl = (url || "").trim();
  const rawUser = (username || "").trim();

  // 1. Website / Site / Link Pessoal
  if (normPlatform === "website" || normPlatform === "site" || normPlatform === "link") {
    const target = rawUrl || rawUser;
    if (!target) return "#";
    if (/^https?:\/\//i.test(target)) {
      return target;
    }
    const clean = target.replace(/^@+/, "");
    return `https://${clean}`;
  }

  // 2. Se informou URL direta válida
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }
  if (rawUser && /^https?:\/\//i.test(rawUser)) {
    return rawUser;
  }

  // 3. Plataformas conhecidas
  const cleanUser = (rawUser || rawUrl).replace(/^@+/, "").trim();
  if (!cleanUser) return "#";

  switch (normPlatform) {
    case "telegram":
      return `https://t.me/${cleanUser}`;
    case "whatsapp":
      return `https://wa.me/${cleanUser.replace(/\D/g, "")}`;
    case "twitter":
    case "x":
      return `https://x.com/${cleanUser}`;
    case "youtube":
      return cleanUser.startsWith("@") ? `https://youtube.com/${cleanUser}` : `https://youtube.com/@${cleanUser}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanUser}`;
    case "instagram":
      return `https://instagram.com/${cleanUser}`;
    case "facebook":
      return `https://facebook.com/${cleanUser}`;
    case "github":
      return `https://github.com/${cleanUser}`;
    case "tiktok":
      return cleanUser.startsWith("@") ? `https://tiktok.com/${cleanUser}` : `https://tiktok.com/@${cleanUser}`;
    default:
      if (rawUrl) {
        return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      }
      return `https://${normPlatform}.com/${cleanUser}`;
  }
}

