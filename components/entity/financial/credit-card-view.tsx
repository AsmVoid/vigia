"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import {
  CardBrand,
  CardBrandLogo,
  CardGradientColor,
  CARD_GRADIENTS,
} from "@/components/shared/card-brands";
import { Button } from "@/components/ui/button";

export interface CreditCardData {
  id?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  brand?: CardBrand | string;
  color?: CardGradientColor | string;
  isRevealed?: boolean;
}

// Ícone Contactless NFC `)))`
function ContactlessIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8.5 7.5c2.5 2.5 2.5 6.5 0 9M11.5 5c3.9 3.9 3.9 10.1 0 14M14.5 2.5c5.2 5.2 5.2 13.8 0 19"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
    </svg>
  );
}

// Chip EMV metálico e realista
function EmvChip({ className = "w-11 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-md overflow-hidden bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-500/60 shadow-md ${className}`}
    >
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full border-t border-b border-black/30 flex items-center justify-center">
          <div className="w-1/2 h-full border-l border-r border-black/30" />
        </div>
      </div>
      <div className="absolute inset-1 rounded-[3px] border border-amber-300/40" />
    </div>
  );
}

// Formatação do número de cartão em blocos de 4
export function formatCardNumber(num?: string, reveal = false): string {
  if (!num) return "•••• •••• •••• ••••";
  const clean = num.replace(/\D/g, "");
  if (!reveal) {
    const last4 = clean.slice(-4) || "••••";
    return `•••• •••• •••• ${last4}`;
  }
  const groups = clean.match(/.{1,4}/g);
  return groups ? groups.join(" ") : clean;
}

export function CreditCardItem({
  data,
  onReveal,
  isRevealed = false,
  isLoading = false,
  showActions = true,
}: {
  data: CreditCardData;
  onReveal?: () => void;
  isRevealed?: boolean;
  isLoading?: boolean;
  showActions?: boolean;
}) {
  const gradient =
    CARD_GRADIENTS.find((g) => g.id === data.color) || CARD_GRADIENTS[4]; // Default: Azul

  const cardholder = (data.cardholderName || "NOME COMPLETO").toUpperCase();
  const expiry = data.expiryDate || "00/00";
  const cvcDisplay = isRevealed ? data.cvc || "000" : "•••";

  return (
    <div className="relative group w-full max-w-[360px] mx-auto select-none">
      <div
        style={{ background: gradient.cssGradient }}
        className="relative aspect-[1.586] w-full rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between overflow-hidden border border-white/20 backdrop-blur-md"
      >
        {/* Reflexo luminoso / glass gloss */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />

        {/* Top Header: Contactless + Bandeira */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ContactlessIcon className="size-6 text-white" />
          </div>
          <div className="flex items-center justify-end">
            <CardBrandLogo brand={data.brand || "visa"} className="h-7 w-auto drop-shadow-sm" />
          </div>
        </div>

        {/* Middle: Número do Cartão */}
        <div className="relative z-10 my-auto py-1">
          <p className="font-mono text-base sm:text-lg tracking-[0.18em] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {formatCardNumber(data.cardNumber, isRevealed)}
          </p>
        </div>

        {/* Bottom Details: Nome do Titular + Expiração + CVC + Chip */}
        <div className="relative z-10 flex items-end justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div>
              <span className="block text-[8px] font-sans font-medium uppercase tracking-wider text-white/70">
                Nome do titular
              </span>
              <span className="block text-xs font-bold truncate text-white drop-shadow-sm">
                {cardholder}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="block text-[8px] font-sans font-medium uppercase tracking-wider text-white/70">
                  Expiração
                </span>
                <span className="block text-xs font-mono font-bold text-white drop-shadow-sm">
                  {expiry}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-sans font-medium uppercase tracking-wider text-white/70">
                  CVC
                </span>
                <span className="block text-xs font-mono font-bold text-white drop-shadow-sm">
                  {cvcDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-end">
            <EmvChip className="w-10 h-7" />
          </div>
        </div>
      </div>

      {/* Botão de Revelação AES-256 */}
      {showActions && onReveal && (
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onReveal}
            className="h-7 px-2.5 text-xs rounded-xl glass border-border/60 hover:border-primary text-foreground gap-1.5 shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isRevealed ? (
              <>
                <EyeOff className="size-3 text-muted-foreground" />
                <span>Ocultar Dados</span>
              </>
            ) : (
              <>
                <Eye className="size-3 text-primary" />
                <span>Revelar Cartão</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Carrossel Sobreposto de Cartões (Stack Deck Carousel)
export function CreditCardCarousel({
  cards,
  revealedFinances = {},
  loadingFinances = {},
  onReveal,
}: {
  cards: CreditCardData[];
  revealedFinances?: Record<string, string>;
  loadingFinances?: Record<string, boolean>;
  onReveal?: (id: string) => void;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!cards || cards.length === 0) return null;

  const current = cards[activeIndex] || cards[0];
  const isRevealed = !!revealedFinances[current.id || ""];
  const isLoading = !!loadingFinances[current.id || ""];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  // Se tiver só 1 cartão, renderiza direto
  if (cards.length === 1) {
    return (
      <div className="py-2">
        <CreditCardItem
          data={current}
          isRevealed={isRevealed}
          isLoading={isLoading}
          onReveal={onReveal && current.id ? () => onReveal(current.id!) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Contêiner de Cartões Sobrepostos */}
      <div className="relative h-[245px] w-full max-w-[360px] mx-auto flex items-center justify-center">
        {cards.map((card, idx) => {
          const offset = idx - activeIndex;
          const isCurrent = idx === activeIndex;
          const isNext = offset === 1 || (activeIndex === cards.length - 1 && idx === 0);
          const isPrev = offset === -1 || (activeIndex === 0 && idx === cards.length - 1);

          let zIndex = 10;
          let scale = 0.9;
          let translateY = 14;
          let opacity = 0;
          let pointerEvents: "auto" | "none" = "none";

          if (isCurrent) {
            zIndex = 30;
            scale = 1;
            translateY = 0;
            opacity = 1;
            pointerEvents = "auto";
          } else if (isNext) {
            zIndex = 20;
            scale = 0.94;
            translateY = 12;
            opacity = 0.7;
            pointerEvents = "auto";
          } else if (isPrev) {
            zIndex = 15;
            scale = 0.9;
            translateY = 22;
            opacity = 0.45;
            pointerEvents = "auto";
          }

          return (
            <motion.div
              key={card.id || idx}
              onClick={() => setActiveIndex(idx)}
              animate={{
                scale,
                y: translateY,
                opacity,
                zIndex,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-0 w-full cursor-pointer"
              style={{ pointerEvents }}
            >
              <CreditCardItem
                data={card}
                isRevealed={!!revealedFinances[card.id || ""]}
                isLoading={!!loadingFinances[card.id || ""]}
                showActions={false}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Controles de Navegação e Revelação */}
      <div className="flex items-center justify-between gap-2 max-w-[360px] mx-auto pt-1">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="size-8 rounded-xl glass border-border/60 hover:border-primary"
            title="Cartão anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="text-[11px] font-mono text-muted-foreground px-2">
            {activeIndex + 1} de {cards.length}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="size-8 rounded-xl glass border-border/60 hover:border-primary"
            title="Próximo cartão"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {onReveal && current.id && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onReveal(current.id!)}
            className="h-8 px-2.5 text-xs rounded-xl glass border-border/60 hover:border-primary text-foreground gap-1.5 shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isRevealed ? (
              <>
                <EyeOff className="size-3.5 text-muted-foreground" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5 text-primary" />
                <span>Revelar</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Indicadores de bolinha */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {cards.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => setActiveIndex(dotIdx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              dotIdx === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
