"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { Globe, Laptop, Wifi, MapPin, Shield, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionDataWidgetProps {
  initialIp?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

interface GeoData {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
}

export function SessionDataWidget({
  initialIp = "127.0.0.1",
  dragHandleProps,
}: SessionDataWidgetProps) {
  const [geo, setGeo] = React.useState<GeoData | null>(null);
  const [platform, setPlatform] = React.useState<string>("—");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [visible, setVisible] = React.useState<boolean>(true);
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("vigia:session:visible");
      if (stored !== null) {
        setVisible(stored === "true");
      }
    } catch {
      // Ignored
    }

    // Detect platform via navigator
    try {
      const p =
        (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ||
        navigator.platform ||
        "—";
      setPlatform(p);
    } catch {
      setPlatform("—");
    }

    // Fetch IP and Geo info with fallback
    const fetchGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(3500),
        });
        if (res.ok) {
          const data = await res.json();
          setGeo(data);
        } else {
          setGeo(null);
        }
      } catch {
        setGeo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGeo();
  }, []);

  const toggleVisibility = () => {
    setVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vigia:session:visible", String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  const ipDisplay = geo?.ip || initialIp || "127.0.0.1";
  const ispDisplay = geo?.org || "Localhost / Rede Privada";
  const locationDisplay =
    geo?.city && geo?.country_name
      ? `${geo.city}, ${geo.country_name}`
      : geo?.country_name || "—";

  const isBlurred = mounted && !visible;

  return (
    <WidgetCard
      id="session_data"
      title="Dados da Sessão"
      description="Conexão do investigador"
      badge="ENCRIPTADO"
      dragHandleProps={dragHandleProps}
      headerAction={
        mounted ? (
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1.5 rounded-xl glass border border-border/40 hover:border-primary/40 hover:text-foreground text-muted-foreground transition-all cursor-pointer"
            aria-label={visible ? "Ocultar dados da sessão" : "Exibir dados da sessão"}
            title={visible ? "Ocultar dados (Privacidade)" : "Exibir dados"}
          >
            {visible ? (
              <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
            ) : (
              <EyeOff className="size-3.5 text-primary" />
            )}
          </button>
        ) : null
      }
    >
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* IP Address */}
        <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
            <Wifi className="size-3 text-primary" />
            Endereço IP
          </span>
          <span
            className={cn(
              "font-mono font-bold text-foreground mt-1 truncate transition-all duration-300",
              isBlurred && "blur-md select-none opacity-40"
            )}
          >
            {ipDisplay}
          </span>
        </div>

        {/* Platform */}
        <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
            <Laptop className="size-3 text-indigo-400" />
            Plataforma
          </span>
          <span className="font-mono font-bold text-foreground mt-1 truncate">
            {platform}
          </span>
        </div>

        {/* ISP / Provider */}
        <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
            <Globe className="size-3 text-emerald-400" />
            Provedor / ASN
          </span>
          <span
            className={cn(
              "font-semibold text-foreground mt-1 truncate transition-all duration-300",
              isBlurred && "blur-md select-none opacity-40"
            )}
            title={isBlurred ? "Oculto" : ispDisplay}
          >
            {ispDisplay}
          </span>
        </div>

        {/* Geo Location */}
        <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
            <MapPin className="size-3 text-rose-400" />
            Localização
          </span>
          <span
            className={cn(
              "font-semibold text-foreground mt-1 truncate transition-all duration-300",
              isBlurred && "blur-md select-none opacity-40"
            )}
            title={isBlurred ? "Oculto" : locationDisplay}
          >
            {locationDisplay}
          </span>
        </div>
      </div>
    </WidgetCard>
  );
}
