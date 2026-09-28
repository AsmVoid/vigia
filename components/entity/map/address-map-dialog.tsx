"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Navigation, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { geocodeAddressAction } from "@/app/(dashboard)/entity/actions";

// Dynamic import with SSR false as strictly required
const DynamicLeafletMap = dynamic(
  () => import("@/components/entity/map/leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-2xl glass border border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Carregando visualização do mapa...</span>
      </div>
    ),
  }
);

interface AddressData {
  id: string;
  label: string;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface AddressMapDialogProps {
  address: AddressData;
  trigger?: React.ReactNode;
  mapsUrl?: string | null;
}

export function AddressMapDialog({ address, trigger, mapsUrl }: AddressMapDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loadingGeocode, setLoadingGeocode] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(
    address.latitude !== null && address.longitude !== null && address.latitude !== undefined && address.longitude !== undefined
      ? { lat: address.latitude, lng: address.longitude }
      : null
  );

  const formattedAddress = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.state,
    address.cep ? `CEP ${address.cep}` : null,
    address.country || "Brasil",
  ]
    .filter(Boolean)
    .join(", ");

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !coords) {
      setLoadingGeocode(true);
      try {
        const res = await geocodeAddressAction(address.id);
        if (res.success && res.latitude !== undefined && res.longitude !== undefined) {
          setCoords({ lat: res.latitude, lng: res.longitude });
          toast.success("Coordenadas geolocalizadas via Nominatim!");
        } else {
          toast.error(res.error || "Não foi possível obter as coordenadas deste endereço.");
        }
      } catch {
        toast.error("Falha ao comunicar com o serviço de geolocalização.");
      } finally {
        setLoadingGeocode(false);
      }
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formattedAddress
  )}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] rounded-xl glass border-border/50 hover:border-primary/50 text-foreground gap-1.5"
          >
            <MapPin className="size-3 text-primary" />
            <span>Ver no Mapa</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass rounded-3xl border-border/60 max-w-2xl p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-ig-gradient text-white shadow-sm">
                <Navigation className="size-4" />
              </span>
              Localização: {address.label}
            </DialogTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-mono px-2 py-1 rounded-lg glass border border-border/40"
                title="Tipo 1: Redirecionamento por busca no Google Maps"
              >
                <span>Google Maps (Busca)</span>
                <ExternalLink className="size-3" />
              </a>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono px-2 py-1 rounded-lg glass border border-emerald-500/40"
                  title={`Tipo 2: Redirecionamento com Link Direto: ${mapsUrl}`}
                >
                  <MapPin className="size-3 text-emerald-500" />
                  <span>Link Direto</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {formattedAddress}
          </p>
        </DialogHeader>

        <div className="mt-4">
          {loadingGeocode ? (
            <div className="h-[380px] w-full rounded-2xl glass border border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Geocodificando endereço via OpenStreetMap Nominatim...</span>
            </div>
          ) : coords ? (
            <div className="space-y-2">
              <DynamicLeafletMap
                latitude={coords.lat}
                longitude={coords.lng}
                label={formattedAddress}
                height="380px"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
                <span>Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ● Geocodificado (Cache Ativo)
                </span>
              </div>
            </div>
          ) : (
            <div className="h-[260px] w-full rounded-2xl bg-muted/20 border border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs p-6 text-center">
              <MapPin className="size-8 text-muted-foreground/50 mb-1" />
              <p className="font-semibold text-foreground">Coordenadas indisponíveis</p>
              <p className="text-[11px] max-w-sm">
                Não foi possível localizar este endereço automaticamente pelo Nominatim.
                Você pode visualizá-lo diretamente no Google Maps.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl mt-2 text-xs"
              >
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Abrir no Google Maps
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
