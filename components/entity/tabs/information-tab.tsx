"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  Car,
  Briefcase,
  GraduationCap,
  CreditCard,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  MessageCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddressMapDialog } from "@/components/entity/map/address-map-dialog";
import {
  revealFinancialAccountAction,
  revealCredentialAction,
} from "@/app/(dashboard)/entity/actions";
import { getZodiacBadge, getZodiacSign } from "@/lib/zodiac";
import { formatBirthDate, getBirthdayCountdown } from "@/lib/date-utils";
import { ZodiacIcon } from "@/components/shared/zodiac-icon";
import { GenderIcon } from "@/components/shared/gender-icon";
import { extractAddressMaps } from "@/lib/maps";
import { motion, useReducedMotion } from "motion/react";
import { BankIcon } from "@/components/shared/bank-icons";
import { PixKeyIcon, CryptoIcon } from "@/components/shared/crypto-icons";
import {
  CreditCardCarousel,
  CreditCardData,
} from "@/components/entity/financial/credit-card-view";

interface InformationTabProps {
  entity: {
    id: string;
    fullName: string;
    cpf?: string | null;
    rg?: string | null;
    gender?: string | null;
    birthDate?: string | Date | null;
    zodiacSign?: string | null;
    currentJob?: string | null;
    fatherId?: string | null;
    fatherName?: string | null;
    father?: { id: string; fullName: string } | null;
    motherId?: string | null;
    motherName?: string | null;
    mother?: { id: string; fullName: string } | null;
    siblings?: Array<{ id: string; fullName: string }>;
    siblingNames?: Array<{ id: string; name: string }>;
    phones: Array<{
      id: string;
      phone: string;
      label: string;
      isWhatsapp: boolean;
      isTelegram?: boolean;
    }>;
    emails: Array<{
      id: string;
      email: string;
      label: string;
    }>;
    addresses: Array<{
      id: string;
      label: string;
      street?: string | null;
      number?: string | null;
      complement?: string | null;
      neighborhood?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      cep?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    }>;
    documents: Array<{
      id: string;
      type: string;
      value: string;
    }>;
    vehicles: Array<{
      id: string;
      placa?: string | null;
      renavam?: string | null;
      chassi?: string | null;
      motor?: string | null;
      marca?: string | null;
      modelo?: string | null;
      ano?: number | null;
      cor?: string | null;
    }>;
    jobs: Array<{
      id: string;
      title: string;
      company?: string | null;
      cnpj?: string | null;
      isCurrent: boolean;
      companyTradeName?: string | null;
      companyLegalNature?: string | null;
      companySize?: string | null;
      companyCapital?: any | null;
      companyAddress?: string | null;
      companyActivity?: string | null;
    }>;
    educations: Array<{
      id: string;
      institution: string;
      course?: string | null;
      degree?: string | null;
      startYear?: number | null;
      endYear?: number | null;
      isCurrent: boolean;
    }>;
    financialAccounts: Array<{
      id: string;
      type: string;
      institution?: string | null;
      identifier?: string | null;
      metadata?: any | null;
    }>;
    credentials: Array<{
      id: string;
      platform: string;
      username: string;
      notes?: string | null;
    }>;
  };
}

export function InformationTab({ entity }: InformationTabProps) {
  const shouldReduceMotion = useReducedMotion();
  // Revealed secrets state (stored locally in memory, never exposed initially in HTML)
  const [revealedFinances, setRevealedFinances] = React.useState<Record<string, string>>({});
  const [loadingFinances, setLoadingFinances] = React.useState<Record<string, boolean>>({});

  const [revealedCreds, setRevealedCreds] = React.useState<Record<string, string>>({});
  const [loadingCreds, setLoadingCreds] = React.useState<Record<string, boolean>>({});

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Birthday Countdown calculation: "🎂 em X dias"
  const birthdayCountdown = React.useMemo(() => {
    return getBirthdayCountdown(entity.birthDate);
  }, [entity.birthDate]);

  const formattedBirth = formatBirthDate(entity.birthDate);

  // Toggle reveal financial account
  const handleToggleRevealFinance = async (accountId: string) => {
    if (revealedFinances[accountId]) {
      const updated = { ...revealedFinances };
      delete updated[accountId];
      setRevealedFinances(updated);
      return;
    }

    setLoadingFinances((prev) => ({ ...prev, [accountId]: true }));
    try {
      const res = await revealFinancialAccountAction(accountId);
      if (res.success && res.identifier) {
        setRevealedFinances((prev) => ({ ...prev, [accountId]: res.identifier! }));
        toast.success("Chave decodificada com sucesso!");
      } else {
        toast.error(res.error || "Falha ao descriptografar dado financeiro.");
      }
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setLoadingFinances((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  // Toggle reveal credential
  const handleToggleRevealCred = async (credId: string) => {
    if (revealedCreds[credId]) {
      const updated = { ...revealedCreds };
      delete updated[credId];
      setRevealedCreds(updated);
      return;
    }

    setLoadingCreds((prev) => ({ ...prev, [credId]: true }));
    try {
      const res = await revealCredentialAction(credId);
      if (res.success && res.password) {
        setRevealedCreds((prev) => ({ ...prev, [credId]: res.password! }));
        toast.success("Credencial decodificada com sucesso!");
      } else {
        toast.error(res.error || "Falha ao descriptografar senha.");
      }
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setLoadingCreds((prev) => ({ ...prev, [credId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Informações Pessoais */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <User className="size-4 text-primary" />
            Informações Pessoais & Registro
          </h2>
          {birthdayCountdown && (
            <span className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono font-semibold">
              {birthdayCountdown}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div
            className="col-span-2 p-3 rounded-2xl bg-muted/20 border border-border/40 min-w-0"
            title={entity.fullName}
          >
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              Nome Completo
            </span>
            <span className="font-semibold text-foreground text-xs truncate block">
              {entity.fullName}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              Nascimento
            </span>
            <span className="font-semibold text-foreground text-xs">
              {formattedBirth || "—"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              Signo
            </span>
            <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              {(() => {
                const zBadge = getZodiacBadge(
                  entity.zodiacSign || (entity.birthDate ? getZodiacSign(entity.birthDate) : null)
                );
                if (zBadge) {
                  return (
                    <>
                      <span>{zBadge.name}</span>
                      <ZodiacIcon sign={zBadge.name} className="size-4" />
                    </>
                  );
                }
                return entity.zodiacSign || "—";
              })()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              Gênero
            </span>
            <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <span>
                {entity.gender === "MALE"
                  ? "Masculino"
                  : entity.gender === "FEMALE"
                    ? "Feminino"
                    : entity.gender || "—"}
              </span>
              {entity.gender && (
                <GenderIcon gender={entity.gender} className="size-3.5" useBrandColor />
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              CPF
            </span>
            <span className="font-semibold text-foreground text-xs">
              {entity.cpf || "—"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              RG
            </span>
            <span className="font-semibold text-foreground text-xs">
              {entity.rg || "—"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              Cargo / Ocupação
            </span>
            <span className="font-semibold text-foreground text-xs truncate block">
              {entity.currentJob || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Documentos Oficiais */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
          <FileText className="size-4 text-primary" />
          Documentos Oficiais ({entity.documents.length})
        </h2>

        {entity.documents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic font-mono">
            Nenhum documento adicional registrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entity.documents.map((doc) => {
              const isCnpj = doc.type === "CNPJ" || doc.value.replace(/\D/g, "").length === 14;
              const cleanVal = doc.value.replace(/\D/g, "");
              const cnpjUrl = `https://cnpja.com/office/${cleanVal}`;

              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      {doc.type.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {doc.value}
                    </span>
                  </div>

                  {isCnpj && (
                    <a
                      href={cnpjUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl glass border border-border/50 hover:border-primary text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[10px]"
                      title="Consultar CNPJ nos registros públicos"
                    >
                      <span>CNPJ</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Telefones & E-mails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telefones */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
            <Phone className="size-4 text-primary" />
            Telefones ({entity.phones.length})
          </h2>

          {entity.phones.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhum telefone registrado.
            </p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {entity.phones.map((p) => {
                const clean = p.phone.replace(/\D/g, "");
                const waUrl = `https://wa.me/${clean.startsWith("55") ? clean : `55${clean}`}`;
                const tgUrl = `https://t.me/+${clean.startsWith("55") ? clean : `55${clean}`}`;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between flex-wrap gap-2"
                  >
                    <div>
                      <span className="font-bold text-foreground">{p.phone}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        ({p.label})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.isWhatsapp && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          title="Abrir no WhatsApp"
                        >
                          <svg className="size-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m-3.53 3.03c-.19 0-.4.07-.61.35-.21.28-.8 1.05-.8 2.56s.82 2.97.94 3.12c.11.16 1.61 2.47 3.91 3.45.55.24.97.38 1.3.48.55.18 1.05.15 1.45.09.44-.06 1.36-.56 1.55-1.1.19-.55.19-1.02.13-1.12-.06-.09-.22-.16-.47-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.38-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {p.isTelegram && (
                        <a
                          href={tgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-[#26A5E4]/10 text-[#26A5E4] border border-[#26A5E4]/30 hover:bg-[#26A5E4]/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          title="Abrir no Telegram"
                        >
                          <svg className="size-3.5 fill-[#26A5E4]" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                          </svg>
                          <span>Telegram</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* E-mails */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
            <Mail className="size-4 text-primary" />
            E-mails ({entity.emails.length})
          </h2>

          {entity.emails.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhum e-mail registrado.
            </p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {entity.emails.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <a
                      href={`mailto:${e.email}`}
                      className="font-bold text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {e.email}
                    </a>
                    <span className="text-[10px] text-muted-foreground">
                      {e.label}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(e.email, e.id)}
                    className="size-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                    title="Copiar e-mail"
                  >
                    {copiedKey === e.id ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Endereços com "Ver no Mapa" e Google Maps */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
          <MapPin className="size-4 text-primary" />
          Endereços & Geolocalização ({entity.addresses.length})
        </h2>

        {entity.addresses.length === 0 ? (
          <p className="text-xs text-muted-foreground italic font-mono">
            Nenhum endereço cadastrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entity.addresses.map((a) => {
              const { cleanComplement, mapsUrl } = extractAddressMaps(a.complement);
              const formatted = [
                a.street,
                a.number,
                cleanComplement,
                a.neighborhood,
                a.city,
                a.state,
                a.cep ? `CEP ${a.cep}` : null,
                a.country || "Brasil",
              ]
                .filter(Boolean)
                .join(", ");

              const standardGmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                formatted
              )}`;

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-muted/20 border border-border/40 flex flex-col justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">
                        {a.label}
                      </span>
                      {a.cep && (
                        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-lg bg-muted/50 border border-border/50">
                          CEP: {a.cep}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {formatted}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30 flex-wrap">
                    {/* Tipo 1: Redirecionamento normal por dados do endereço */}
                    <a
                      href={standardGmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl glass border border-border/50 hover:border-primary text-muted-foreground hover:text-foreground text-[11px] font-semibold flex items-center gap-1 transition-all"
                      title="Tipo 1: Redirecionar para o Google Maps buscando com dados do endereço"
                    >
                      <MapPin className="size-3 text-primary" />
                      <span>Google Maps (Busca)</span>
                      <ExternalLink className="size-2.5 opacity-70" />
                    </a>

                    {/* Tipo 2: Redirecionamento com Link direto para o local exato */}
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl glass border border-emerald-500/40 hover:border-emerald-500 text-emerald-500 hover:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs"
                        title={`Tipo 2: Redirecionamento com link direto para o local exato: ${mapsUrl}`}
                      >
                        <MapPin className="size-3 text-emerald-500" />
                        <span>Link Direto (maps.app.goo.gl)</span>
                        <ExternalLink className="size-2.5 opacity-70" />
                      </a>
                    )}

                    <AddressMapDialog
                      address={{ ...a, complement: cleanComplement }}
                      mapsUrl={mapsUrl}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Família & Filiação */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
          <Users className="size-4 text-primary" />
          Filiação & Família
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          {/* Pai */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Pai
            </span>
            {entity.father ? (
              <Link
                href={`/entity/${entity.father.id}`}
                className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>{entity.father.fullName}</span>
                <ExternalLink className="size-3" />
              </Link>
            ) : entity.fatherName ? (
              <span className="font-bold text-foreground">{entity.fatherName}</span>
            ) : (
              <span className="text-muted-foreground italic">Não informado</span>
            )}
          </div>

          {/* Mãe */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Mãe
            </span>
            {entity.mother ? (
              <Link
                href={`/entity/${entity.mother.id}`}
                className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>{entity.mother.fullName}</span>
                <ExternalLink className="size-3" />
              </Link>
            ) : entity.motherName ? (
              <span className="font-bold text-foreground">{entity.motherName}</span>
            ) : (
              <span className="text-muted-foreground italic">Não informada</span>
            )}
          </div>

          {/* Irmãos */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Irmãos ({((entity.siblings?.length || 0) + (entity.siblingNames?.length || 0))})
            </span>
            {(entity.siblings?.length || 0) === 0 && (entity.siblingNames?.length || 0) === 0 ? (
              <span className="text-muted-foreground italic">Nenhum</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {entity.siblings?.map((s) => (
                  <Link
                    key={s.id}
                    href={`/entity/${s.id}`}
                    className="px-2 py-0.5 rounded-lg bg-primary/15 text-foreground border border-primary/40 hover:bg-primary/25 transition-all text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>{s.fullName}</span>
                    <ExternalLink className="size-2.5" />
                  </Link>
                ))}
                {entity.siblingNames?.map((sn) => (
                  <span
                    key={sn.id}
                    className="px-2 py-0.5 rounded-lg bg-muted/40 text-muted-foreground border border-border/40 text-[11px]"
                  >
                    {sn.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Veículos (com RENAVAM em destaque) */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
          <Car className="size-4 text-primary" />
          Veículos Automotores ({entity.vehicles.length})
        </h2>

        {entity.vehicles.length === 0 ? (
          <p className="text-xs text-muted-foreground italic font-mono">
            Nenhum veículo cadastrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {entity.vehicles.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
                  <span className="font-bold text-foreground text-sm">
                    {[v.marca, v.modelo].filter(Boolean).join(" ") || "Veículo"}
                  </span>
                  {v.placa && (
                    <span className="px-2 py-0.5 rounded-lg bg-primary/20 text-foreground border border-primary/40 font-bold">
                      {v.placa}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {v.renavam && (
                    <div className="col-span-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        RENAVAM:
                      </span>
                      <span>{v.renavam}</span>
                    </div>
                  )}
                  {v.ano && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Ano:</span>
                      <span className="text-foreground">{v.ano}</span>
                    </div>
                  )}
                  {v.cor && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Cor:</span>
                      <span className="text-foreground">{v.cor}</span>
                    </div>
                  )}
                  {v.chassi && (
                    <div className="col-span-2 truncate">
                      <span className="text-[10px] text-muted-foreground block">Chassi:</span>
                      <span className="text-foreground truncate block">{v.chassi}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Empregos & Educação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empregos */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
            <Briefcase className="size-4 text-primary" />
            Histórico Profissional ({entity.jobs.length})
          </h2>

          {entity.jobs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhum vínculo profissional cadastrado.
            </p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {entity.jobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{j.title}</span>
                    <div className="flex items-center gap-1.5">
                      {j.companyTradeName && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold tracking-wide flex items-center gap-0.5">
                          ⚡ OSINT
                        </span>
                      )}
                      {j.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Atual
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {j.company || "Empresa não informada"}
                    {j.cnpj && ` • CNPJ: ${j.cnpj}`}
                  </p>

                  {/* Detalhes Enriquecidos BrasilAPI */}
                  {j.companyTradeName && (
                    <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Razão Social:</span>
                        <span className="text-foreground font-semibold text-right truncate">
                          {j.companyTradeName}
                        </span>
                      </div>
                      {j.companyCapital && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Capital Social:</span>
                          <span className="text-emerald-400 font-semibold">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(j.companyCapital))}
                          </span>
                        </div>
                      )}
                      {j.companyLegalNature && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Natureza Jurídica:</span>
                          <span className="text-foreground text-right truncate">
                            {j.companyLegalNature}
                          </span>
                        </div>
                      )}
                      {j.companySize && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Porte:</span>
                          <span className="text-foreground">{j.companySize}</span>
                        </div>
                      )}
                      {j.companyAddress && (
                        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                          Sede: {j.companyAddress}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escolaridade */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground border-b border-border/40 pb-3">
            <GraduationCap className="size-4 text-primary" />
            Educação & Formação ({entity.educations.length})
          </h2>

          {entity.educations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhuma formação acadêmica cadastrada.
            </p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {entity.educations.map((ed) => (
                <div
                  key={ed.id}
                  className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{ed.course || ed.institution}</span>
                    {(ed.startYear || ed.endYear) && (
                      <span className="text-[10px] text-muted-foreground">
                        {[ed.startYear, ed.endYear].filter(Boolean).join(" - ")}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {ed.institution} {ed.degree && `• ${ed.degree}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8. Financeiro & Credenciais (COM REVELAÇÃO SOB DEMANDA AES-256-GCM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contas Financeiras */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <CreditCard className="size-4 text-primary shrink-0" />
              <span>Contas & PIX ({entity.financialAccounts.length})</span>
            </h2>
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              ● Criptografia AES-256
            </span>
          </div>

          {entity.financialAccounts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhuma conta financeira registrada.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Cartões de Crédito (Carrossel Sobreposto Redesenhado) */}
              {(() => {
                const creditCards: CreditCardData[] = entity.financialAccounts
                  .filter((acc) => acc.type === "CREDIT_CARD")
                  .map((acc) => {
                    const meta = ((acc as any).metadata || {}) as Record<string, any>;
                    const isRevealed = !!revealedFinances[acc.id];
                    return {
                      id: acc.id,
                      cardholderName: meta.cardholderName || entity.fullName,
                      cardNumber: isRevealed
                        ? revealedFinances[acc.id] || meta.cardNumber || acc.identifier
                        : meta.cardNumber || acc.identifier,
                      expiryDate: meta.expiryDate || "••/••",
                      cvc: isRevealed ? meta.cvc || "•••" : "•••",
                      brand: meta.brand || acc.institution || "visa",
                      color: meta.color || "azul",
                      isRevealed,
                    };
                  });

                if (creditCards.length === 0) return null;

                return (
                  <div className="border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                        <CreditCard className="size-3.5 text-primary" />
                        <span>Cartões de Crédito ({creditCards.length})</span>
                      </span>
                    </div>
                    <CreditCardCarousel
                      cards={creditCards}
                      revealedFinances={revealedFinances}
                      loadingFinances={loadingFinances}
                      onReveal={handleToggleRevealFinance}
                    />
                  </div>
                );
              })()}

              {/* Contas Bancárias (Com SVGs oficiais e 5 campos completos) */}
              {(() => {
                const bankAccounts = entity.financialAccounts.filter(
                  (acc) => acc.type === "BANK_ACCOUNT"
                );
                if (bankAccounts.length === 0) return null;

                // Auxiliar para extrair agência, conta e localização caso estejam no formato legado
                const parseLegacyBankId = (idStr?: string | null) => {
                  if (!idStr) return {};
                  const agMatch = idStr.match(/Ag:\s*([^|\n]+)/i);
                  const ccMatch = idStr.match(/CC:\s*([^\s-]+)/i);
                  const locMatch = idStr.match(/-\s*([^/]+)\/([A-Za-z]{2})/i);
                  return {
                    agency: agMatch ? agMatch[1].trim() : undefined,
                    accountNumber: ccMatch ? ccMatch[1].trim() : undefined,
                    city: locMatch ? locMatch[1].trim() : undefined,
                    state: locMatch ? locMatch[2].trim() : undefined,
                  };
                };

                return (
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                      <span>Contas Bancárias ({bankAccounts.length})</span>
                    </span>
                    <div className="space-y-2">
                      {bankAccounts.map((acc) => {
                        const meta = ((acc as any).metadata || {}) as Record<string, any>;
                        const isRevealed = !!revealedFinances[acc.id];
                        const isLoading = !!loadingFinances[acc.id];
                        const rawId = isRevealed
                          ? (revealedFinances[acc.id] || acc.identifier || "")
                          : (acc.identifier || "");
                        const legacy = parseLegacyBankId(rawId);

                        const bankName = meta.bank || acc.institution || "Banco";
                        const agency = meta.agency || legacy.agency || "—";

                        // Limpa o número da conta para nunca exibir a string inteira "Ag: ... | CC: ..." dentro da caixa de Conta Corrente
                        let cleanAccount = meta.accountNumber || legacy.accountNumber;
                        if (!cleanAccount && rawId) {
                          cleanAccount = rawId
                            .replace(/^Ag:\s*[^|]+\|\s*CC:\s*/i, "")
                            .replace(/\s*-\s*[^/]+\/[A-Za-z]{2}$/i, "")
                            .trim();
                        }

                        const accountNum = isRevealed
                          ? cleanAccount || "••••••••"
                          : cleanAccount
                          ? `•••• ${cleanAccount.slice(-4)}`
                          : "••••••••";

                        const city = meta.city || legacy.city;
                        const state = meta.state || legacy.state;
                        const location = [city, state].filter(Boolean).join(" / ");

                        return (
                          <div
                            key={acc.id}
                            className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BankIcon bank={bankName} className="size-6 shrink-0 shadow-xs" />
                                <div>
                                  <span className="font-bold text-xs text-foreground block">
                                    {bankName}
                                  </span>
                                  {location && (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      {location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleToggleRevealFinance(acc.id)}
                                className="h-7 px-2.5 text-[11px] rounded-xl glass border-border/60 hover:border-primary text-foreground gap-1.5"
                              >
                                {isLoading ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isRevealed ? (
                                  <>
                                    <EyeOff className="size-3 text-muted-foreground" />
                                    <span>Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="size-3 text-primary" />
                                    <span>Revelar</span>
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                              <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                                <span className="text-[10px] text-muted-foreground block">Agência</span>
                                <span className="font-semibold text-foreground">{agency}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-background/50 border border-border/40 flex items-center justify-between">
                                <div className="min-w-0 pr-1">
                                  <span className="text-[10px] text-muted-foreground block">Conta Corrente</span>
                                  <span className="font-semibold text-foreground truncate block">{accountNum}</span>
                                </div>
                                {isRevealed && cleanAccount && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(cleanAccount, acc.id)}
                                    className="size-6 rounded text-muted-foreground hover:text-foreground shrink-0"
                                    title="Copiar conta"
                                  >
                                    {copiedKey === acc.id ? (
                                      <Check className="size-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Chaves PIX & Carteiras Cripto (Com SVGs oficiais de Chave Pix e Criptos) */}
              {(() => {
                const otherAccounts = entity.financialAccounts.filter(
                  (acc) => acc.type === "PIX" || acc.type === "CRYPTO_WALLET"
                );
                if (otherAccounts.length === 0) return null;

                return (
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                      <span>PIX & Cripto ({otherAccounts.length})</span>
                    </span>
                    <div className="space-y-2 font-mono text-xs">
                      {otherAccounts.map((acc) => {
                        const isRevealed = !!revealedFinances[acc.id];
                        const isLoading = !!loadingFinances[acc.id];
                        const valueText = isRevealed ? revealedFinances[acc.id] : "••••••••••••••••";
                        const isPix = acc.type === "PIX";
                        const cryptoSymbol = !isPix
                          ? acc.institution || (acc as any).metadata?.symbol || "BTC"
                          : null;

                        return (
                          <div
                            key={acc.id}
                            className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isPix ? (
                                  <PixKeyIcon className="size-5 shrink-0" />
                                ) : (
                                  <CryptoIcon symbol={cryptoSymbol} className="size-5 shrink-0" />
                                )}
                                <div>
                                  <span className="text-[11px] font-bold text-foreground block">
                                    {isPix ? "Chave PIX" : `Carteira Cripto • ${cryptoSymbol || "Ativo"}`}
                                  </span>
                                  {acc.institution && isPix && (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      {acc.institution}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleToggleRevealFinance(acc.id)}
                                className="h-7 px-2.5 text-[11px] rounded-xl glass border-border/60 hover:border-primary text-foreground gap-1.5"
                              >
                                {isLoading ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isRevealed ? (
                                  <>
                                    <EyeOff className="size-3 text-muted-foreground" />
                                    <span>Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="size-3 text-primary" />
                                    <span>Revelar</span>
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40 overflow-hidden">
                              <motion.span
                                key={isRevealed ? "revealed" : "hidden"}
                                initial={shouldReduceMotion ? false : { filter: "blur(4px)", rotateX: 90 }}
                                animate={{ filter: "blur(0px)", rotateX: 0 }}
                                transition={{ duration: 0.25 }}
                                className="font-mono text-xs font-semibold text-foreground truncate select-all inline-block"
                              >
                                {valueText}
                              </motion.span>
                              {isRevealed && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(valueText, acc.id)}
                                  className="size-6 rounded text-muted-foreground hover:text-foreground shrink-0"
                                  title="Copiar"
                                >
                                  {copiedKey === acc.id ? (
                                    <Check className="size-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Credenciais de Acesso */}
        <div className="glass rounded-3xl p-6 border-border/50 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Key className="size-4 text-primary shrink-0" />
              <span>Credenciais & Senhas ({entity.credentials.length})</span>
            </h2>
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              ● Criptografia AES-256
            </span>
          </div>

          {entity.credentials.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-mono">
              Nenhuma credencial registrada.
            </p>
          ) : (
            <div className="space-y-2.5 font-mono text-xs">
              {entity.credentials.map((cred) => {
                const isRevealed = !!revealedCreds[cred.id];
                const isLoading = !!loadingCreds[cred.id];
                const passwordText = isRevealed ? revealedCreds[cred.id] : "••••••••••••••••";

                return (
                  <div
                    key={cred.id}
                    className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-bold text-foreground block truncate">
                          {cred.platform}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Usuário: {cred.username}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleToggleRevealCred(cred.id)}
                        className="h-7 px-2.5 text-[11px] rounded-xl glass border-border/60 hover:border-primary text-foreground gap-1.5 shrink-0"
                      >
                        {isLoading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isRevealed ? (
                          <>
                            <EyeOff className="size-3 text-muted-foreground" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="size-3 text-primary" />
                            <span>Revelar</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40 overflow-hidden">
                      <motion.span
                        key={isRevealed ? "revealed" : "hidden"}
                        initial={shouldReduceMotion ? false : { filter: "blur(4px)", rotateX: 90 }}
                        animate={{ filter: "blur(0px)", rotateX: 0 }}
                        transition={{ duration: 0.25 }}
                        className="font-mono text-xs font-semibold text-foreground truncate select-all inline-block"
                      >
                        {passwordText}
                      </motion.span>
                      {isRevealed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(passwordText, cred.id)}
                          className="size-6 rounded text-muted-foreground hover:text-foreground shrink-0"
                          title="Copiar senha"
                        >
                          {copiedKey === cred.id ? (
                            <Check className="size-3 text-emerald-400" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
