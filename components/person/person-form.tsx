"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Share2,
  FileText,
  Car,
  Briefcase,
  GraduationCap,
  CreditCard,
  Key,
  Users,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  Sparkles,
  ArrowLeft,
  Calendar,
  Shield,
  Eye,
  Building2,
  Flame,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IgAvatar } from "@/components/shared/ig-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EntityFormSchema,
  type EntityFormData,
  type EntityFormInput,
} from "@/lib/schemas/person";
import {
  createEntityAction,
  updateEntityAction,
  fetchCnpjQuickAction,
} from "@/app/(dashboard)/person/actions";
import { getZodiacSign, getZodiacInfo, getZodiacBadge } from "@/lib/zodiac";
import { ZodiacIcon } from "@/components/shared/zodiac-icon";
import { GenderIcon } from "@/components/shared/gender-icon";
import { SOCIAL_BRANDS, SocialIcon } from "@/components/shared/social-icons";
import { BankIcon, BANKS_LIST, getBankInfo } from "@/components/shared/bank-icons";
import {
  CardBrand,
  CARD_BRANDS,
  CardBrandLogo,
  CardGradientColor,
  CARD_GRADIENTS,
} from "@/components/shared/card-brands";
import { CreditCardItem } from "@/components/entity/financial/credit-card-view";
import { PixKeyIcon, CryptoIcon, CRYPTO_LIST } from "@/components/shared/crypto-icons";
import { extractAddressMaps } from "@/lib/maps";
import { cn } from "@/lib/utils";

export interface AvailableEntity {
  id: string;
  fullName: string;
  photo?: string | null;
  gender?: string | null;
}

export interface AvailableGroup {
  id: string;
  name: string;
  color: string;
}

interface PersonFormProps {
  initialData?: EntityFormData;
  entityId?: string;
  groups: AvailableGroup[];
  availableEntities: AvailableEntity[];
}

const DOCUMENT_TYPES = [
  { value: "CNH", label: "CNH (Carteira Nacional de Habilitação)" },
  { value: "PASSAPORTE", label: "Passaporte" },
  { value: "TITULO_ELEITOR", label: "Título de Eleitor" },
  { value: "CNS", label: "Cartão Nacional de Saúde (CNS)" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "PIS", label: "PIS / PASEP" },
  { value: "CERTIDAO_NASCIMENTO", label: "Certidão de Nascimento" },
  { value: "CERTIDAO_CASAMENTO", label: "Certidão de Casamento" },
];

const FINANCE_TYPES = [
  { value: "PIX", label: "Chave PIX" },
  { value: "BANK_ACCOUNT", label: "Conta Bancária" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "CRYPTO_WALLET", label: "Carteira Cripto" },
];

interface FormSectionProps {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  hasError?: boolean;
  children: React.ReactNode;
}

function FormSection({
  isOpen,
  onToggle,
  icon,
  iconBg = "bg-primary/15 text-primary",
  title,
  subtitle,
  badge,
  hasError,
  children,
}: FormSectionProps) {
  const [animating, setAnimating] = React.useState(false);

  return (
    <motion.div
      animate={hasError ? { x: [-4, 4, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-3xl glass border transition-all duration-300 overflow-hidden shadow-xs",
        hasError ? "border-destructive/80 shadow-destructive/20" : "border-border/60"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 text-foreground font-bold text-sm">
          <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            {icon}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span>{title}</span>
              {badge}
            </div>
            {subtitle && (
              <span className="text-[11px] text-muted-foreground font-normal">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            onAnimationStart={() => setAnimating(true)}
            onAnimationComplete={() => setAnimating(false)}
            className={animating ? "overflow-hidden" : "overflow-visible"}
          >
            <div className="px-6 pb-6 pt-2 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function normalizeDefaultValues(data?: Partial<EntityFormData>): EntityFormData {
  const formatDate = (val: any) => {
    if (!val) return "";
    if (val instanceof Date) return val.toISOString().split("T")[0];
    if (typeof val === "string") return val.includes("T") ? val.split("T")[0] : val;
    return "";
  };

  const clean = (v: any) => (v === null ? undefined : v);

  return {
    fullName: data?.fullName ?? "",
    aliases: (data?.aliases || []).filter(Boolean),
    photo: clean(data?.photo) ?? "",
    cpf: clean(data?.cpf) ?? "",
    rg: clean(data?.rg) ?? "",
    gender: clean(data?.gender) ?? null,
    birthDate: formatDate(data?.birthDate),
    zodiacSign: clean(data?.zodiacSign) ?? "",
    currentJob: clean(data?.currentJob) ?? "",
    notes: clean(data?.notes) ?? "",
    groupId: clean(data?.groupId) ?? "",
    isBurner: !!data?.isBurner,
    expiresAt: data?.expiresAt ? String(data.expiresAt).slice(0, 16) : "",
    phones: (data?.phones || []).map((p: any) => ({
      id: p.id,
      phone: p.phone ?? "",
      label: p.label ?? "Principal",
      isWhatsapp: p.isWhatsapp ?? true,
      isTelegram: p.isTelegram ?? false,
    })),
    emails: (data?.emails || []).map((e: any) => ({
      id: e.id,
      email: e.email ?? "",
      label: e.label ?? "Principal",
    })),
    addresses: (data?.addresses || []).map((a: any) => {
      const { cleanComplement, mapsUrl } = extractAddressMaps(clean(a.complement));
      return {
        id: a.id,
        label: a.label ?? "Residencial",
        cep: clean(a.cep) ?? "",
        street: clean(a.street) ?? "",
        number: clean(a.number) ?? "",
        complement: cleanComplement,
        mapsUrl: a.mapsUrl ?? mapsUrl ?? "",
        neighborhood: clean(a.neighborhood) ?? "",
        city: clean(a.city) ?? "",
        state: clean(a.state) ?? "",
        country: a.country ?? "Brasil",
      };
    }),
    socialProfiles: (data?.socialProfiles || []).map((s: any) => ({
      id: s.id,
      platform: s.platform ?? "",
      username: s.username ?? "",
      url: clean(s.url) ?? "",
    })),
    documents: (data?.documents || []).map((d: any) => ({
      id: d.id,
      type: d.type,
      value: d.value ?? "",
    })),
    vehicles: (data?.vehicles || []).map((v: any) => ({
      id: v.id,
      placa: clean(v.placa) ?? "",
      renavam: clean(v.renavam) ?? "",
      chassi: clean(v.chassi) ?? "",
      motor: clean(v.motor) ?? "",
      marca: clean(v.marca) ?? "",
      modelo: clean(v.modelo) ?? "",
      ano: clean(v.ano) ?? null,
      cor: clean(v.cor) ?? "",
    })),
    jobs: (data?.jobs || []).map((j: any) => ({
      id: j.id,
      title: j.title ?? "",
      company: clean(j.company) ?? "",
      cnpj: clean(j.cnpj) ?? "",
      companyTradeName: clean(j.companyTradeName) ?? "",
      companyLegalNature: clean(j.companyLegalNature) ?? "",
      companySize: clean(j.companySize) ?? "",
      companyCapital: clean(j.companyCapital) ?? "",
      companyAddress: clean(j.companyAddress) ?? "",
      companyPhone: clean(j.companyPhone) ?? "",
      companyEmail: clean(j.companyEmail) ?? "",
      companyActivity: clean(j.companyActivity) ?? "",
      isCurrent: j.isCurrent ?? true,
    })),
    educations: (data?.educations || []).map((ed: any) => ({
      id: ed.id,
      institution: ed.institution ?? "",
      course: clean(ed.course) ?? "",
      degree: clean(ed.degree) ?? "",
      startYear: clean(ed.startYear) ?? null,
      endYear: clean(ed.endYear) ?? null,
      isCurrent: ed.isCurrent ?? false,
    })),
    financialAccounts: (data?.financialAccounts || []).map((f: any) => {
      let meta = f.metadata || null;
      if (f.type === "BANK_ACCOUNT") {
        if ((!meta || !meta.agency) && f.identifier) {
          const agMatch = f.identifier.match(/Ag:\s*([^|\n]+)/i);
          const ccMatch = f.identifier.match(/CC:\s*([^\s-]+)/i);
          const locMatch = f.identifier.match(/-\s*([^/]+)\/([A-Za-z]{2})/i);
          meta = {
            bank: meta?.bank || clean(f.institution) || "Banco",
            agency: meta?.agency || (agMatch ? agMatch[1].trim() : ""),
            accountNumber: meta?.accountNumber || (ccMatch ? ccMatch[1].trim() : f.identifier),
            city: meta?.city || (locMatch ? locMatch[1].trim() : ""),
            state: meta?.state || (locMatch ? locMatch[2].trim() : ""),
          };
        }
      } else if (f.type === "CREDIT_CARD") {
        if (!meta) {
          meta = {
            cardholderName: data?.fullName || "NOME DO TITULAR",
            cardNumber: f.identifier || "",
            expiryDate: "",
            cvc: "",
            brand: clean(f.institution) || "visa",
            color: "azul",
          };
        }
      }
      return {
        id: f.id,
        type: f.type ?? "PIX",
        institution: clean(f.institution) ?? "",
        identifier: f.identifier ?? "",
        metadata: meta,
      };
    }),
    credentials: (data?.credentials || []).map((c: any) => ({
      id: c.id,
      platform: c.platform ?? "",
      username: c.username ?? "",
      passwordHash: c.passwordHash ?? "",
      notes: clean(c.notes) ?? "",
    })),
    fatherId: clean(data?.fatherId) ?? "",
    fatherName: clean(data?.fatherName) ?? "",
    motherId: clean(data?.motherId) ?? "",
    motherName: clean(data?.motherName) ?? "",
    siblingIds: data?.siblingIds || [],
    siblingNames: (data?.siblingNames || [])
      .map((s: any) => (typeof s === "string" ? s : s?.name || ""))
      .filter(Boolean),
  };
}

export function PersonForm({
  initialData,
  entityId,
  groups,
  availableEntities,
}: PersonFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [newAlias, setNewAlias] = React.useState("");
  const [newSiblingName, setNewSiblingName] = React.useState("");

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    basic: true,
    contacts: true,
    addresses: true,
    socials: true,
    documents: false,
    vehicles: false,
    jobs: false,
    educations: false,
    finances: false,
    credentials: false,
    family: false,
    burner: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isEdit = !!entityId;

  const normalizedDefaults = React.useMemo(
    () => normalizeDefaultValues(initialData),
    [initialData]
  );

  const form = useForm<EntityFormInput, any, EntityFormData>({
    resolver: standardSchemaResolver(EntityFormSchema),
    defaultValues: normalizedDefaults,
  });

  const { register, control, handleSubmit, setValue, watch, formState } = form;
  const { errors } = formState;

  // Watch birthDate to auto-calculate zodiac sign with symbol
  const watchedBirthDate = watch("birthDate");
  const computedZodiacInfo = React.useMemo(() => {
    return watchedBirthDate ? getZodiacInfo(watchedBirthDate) : null;
  }, [watchedBirthDate]);

  React.useEffect(() => {
    if (computedZodiacInfo) {
      setValue("zodiacSign", computedZodiacInfo.name);
    }
  }, [computedZodiacInfo, setValue]);

  // Field Arrays for dynamic rows
  const phonesArray = useFieldArray({ control, name: "phones" });
  const emailsArray = useFieldArray({ control, name: "emails" });
  const addressesArray = useFieldArray({ control, name: "addresses" });
  const socialsArray = useFieldArray({ control, name: "socialProfiles" });
  const documentsArray = useFieldArray({ control, name: "documents" });
  const vehiclesArray = useFieldArray({ control, name: "vehicles" });
  const jobsArray = useFieldArray({ control, name: "jobs" });
  const educationsArray = useFieldArray({ control, name: "educations" });
  const financeArray = useFieldArray({ control, name: "financialAccounts" });
  const credentialsArray = useFieldArray({ control, name: "credentials" });

  const watchedAliases = watch("aliases") || [];
  const watchedSiblingNames = watch("siblingNames") || [];
  const watchedSiblingIds = watch("siblingIds") || [];
  const watchedIsBurner = watch("isBurner");
  const watchedExpiresAt = watch("expiresAt");
  const watchedPhoto = watch("photo");

  // Add alias tag
  const handleAddAlias = () => {
    if (newAlias.trim()) {
      setValue("aliases", [...watchedAliases, newAlias.trim()]);
      setNewAlias("");
    }
  };

  const handleRemoveAlias = (index: number) => {
    const updated = [...watchedAliases];
    updated.splice(index, 1);
    setValue("aliases", updated);
  };

  // Add free-text sibling name
  const handleAddSiblingName = () => {
    if (newSiblingName.trim()) {
      setValue("siblingNames", [...watchedSiblingNames, newSiblingName.trim()]);
      setNewSiblingName("");
    }
  };

  const handleRemoveSiblingName = (index: number) => {
    const updated = [...watchedSiblingNames];
    updated.splice(index, 1);
    setValue("siblingNames", updated);
  };

  // Toggle sibling entity connection
  const toggleSiblingId = (targetId: string) => {
    const set = new Set(watchedSiblingIds);
    if (set.has(targetId)) {
      set.delete(targetId);
    } else {
      set.add(targetId);
    }
    setValue("siblingIds", Array.from(set));
  };

  // CNPJ OSINT lookup
  const [loadingCnpjIdx, setLoadingCnpjIdx] = React.useState<number | null>(null);

  const handleCnpjLookup = async (idx: number) => {
    const cnpj = watch(`jobs.${idx}.cnpj`);
    if (!cnpj || !cnpj.trim()) {
      toast.error("Informe um CNPJ para buscar os dados cadastrais.");
      return;
    }
    setLoadingCnpjIdx(idx);
    try {
      const res = await fetchCnpjQuickAction(cnpj.trim());
      if (res.success && res.data) {
        if (!watch(`jobs.${idx}.company`)) {
          setValue(`jobs.${idx}.company`, res.data.company);
        }
        setValue(`jobs.${idx}.companyTradeName`, res.data.companyTradeName);
        setValue(`jobs.${idx}.companyCapital`, res.data.companyCapital || "");
        setValue(`jobs.${idx}.companyLegalNature`, res.data.companyLegalNature);
        setValue(`jobs.${idx}.companySize`, res.data.companySize);
        setValue(`jobs.${idx}.companyAddress`, res.data.companyAddress);
        setValue(`jobs.${idx}.companyPhone`, res.data.companyPhone);
        setValue(`jobs.${idx}.companyEmail`, res.data.companyEmail);
        setValue(`jobs.${idx}.companyActivity`, res.data.companyActivity);
        toast.success(`Dados da empresa "${res.data.company}" carregados via BrasilAPI!`);
      } else {
        toast.error(res.error || "CNPJ não encontrado ou indisponível.");
      }
    } catch {
      toast.error("Falha ao comunicar com o serviço de CNPJ.");
    } finally {
      setLoadingCnpjIdx(null);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha no upload.");
      }

      const data = await res.json();
      setValue("photo", data.url);
      toast.success("Foto enviada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Auto-fill ViaCEP onBlur
  const handleCepBlur = async (index: number, cepValue: string | undefined | null) => {
    if (!cepValue) return;
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setValue(`addresses.${index}.street`, data.logradouro || "");
            setValue(`addresses.${index}.neighborhood`, data.bairro || "");
            setValue(`addresses.${index}.city`, data.localidade || "");
            setValue(`addresses.${index}.state`, data.uf || "");
            if (data.complemento && !form.getValues(`addresses.${index}.complement`)) {
              setValue(`addresses.${index}.complement`, data.complemento);
            }
            toast.success(`CEP ${clean} localizado: ${data.localidade}/${data.uf}`);
          } else {
            toast.error("CEP não encontrado.");
          }
        }
      } catch {
        // ignore
      }
    }
  };

  const onSubmit = async (data: EntityFormData) => {
    setSubmitting(true);
    try {
      if (isEdit && entityId) {
        const res = await updateEntityAction(entityId, data);
        if (res.success) {
          toast.success("Pessoa atualizada com sucesso!");
          router.push(`/tree`);
          router.refresh();
        } else {
          toast.error(res.error || "Erro ao atualizar.");
        }
      } else {
        const res = await createEntityAction(data);
        if (res.success) {
          toast.success("Pessoa cadastrada com sucesso!");
          router.push("/tree");
          router.refresh();
        } else {
          toast.error(res.error || "Erro ao cadastrar.");
        }
      }
    } catch (err) {
      toast.error("Erro inesperado ao salvar os dados.");
    } finally {
      setSubmitting(false);
    }
  };

  const FIELD_LABELS: Record<string, string> = {
    fullName: "Nome Completo",
    groupId: "Grupo",
    birthDate: "Data de Nascimento",
    gender: "Gênero",
    cpf: "CPF",
    phones: "Telefones",
    emails: "E-mails",
    addresses: "Endereços",
    socialMedia: "Redes Sociais",
    financialAccounts: "Contas & PIX",
    credentials: "Credenciais & Senhas",
    vehicles: "Veículos",
    companies: "Empresas",
    relationships: "Relacionamentos",
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return "Campo inválido.";
    if (typeof err.message === "string" && err.message) return err.message;
    if (Array.isArray(err)) {
      for (const item of err) {
        if (item) {
          const msg = getErrorMessage(item);
          if (msg) return msg;
        }
      }
    }
    if (typeof err === "object") {
      for (const key of Object.keys(err)) {
        if (key === "ref") continue;
        const msg = getErrorMessage(err[key]);
        if (msg) return msg;
      }
    }
    return "Verifique o preenchimento deste campo.";
  };

  const FIELD_TO_SECTION: Record<string, string> = {
    fullName: "basic",
    aliases: "basic",
    photo: "basic",
    cpf: "basic",
    rg: "basic",
    gender: "basic",
    birthDate: "basic",
    zodiacSign: "basic",
    currentJob: "basic",
    notes: "basic",
    groupId: "basic",
    phones: "contacts",
    emails: "contacts",
    addresses: "addresses",
    socialProfiles: "socials",
    documents: "documents",
    vehicles: "vehicles",
    jobs: "jobs",
    educations: "educations",
    financialAccounts: "finances",
    credentials: "credentials",
    fatherId: "family",
    fatherName: "family",
    motherId: "family",
    motherName: "family",
    siblingIds: "family",
    siblingNames: "family",
    isBurner: "burner",
    expiresAt: "burner",
  };

  const onInvalid = (fieldErrors: any) => {
    console.error("Form validation errors:", fieldErrors);
    const keys = Object.keys(fieldErrors);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const err = fieldErrors[firstKey];
      const label = FIELD_LABELS[firstKey] || firstKey;
      const message = (err as any)?.message || getErrorMessage(err);

      // Auto-open the accordion section containing the invalid field
      const sectionKey = FIELD_TO_SECTION[firstKey];
      if (sectionKey) {
        setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
      }

      toast.error(`Atenção no campo ${label}: ${message}`);
    } else {
      toast.error("Por favor, verifique os campos obrigatórios.");
    }
  };

  const sectionHasError = (sectionId: string) => {
    return Object.keys(errors).some((key) => FIELD_TO_SECTION[key] === sectionId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="size-9 rounded-xl border border-border/50 glass"
            title="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <span className="text-ig-gradient">
                {isEdit ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                DOSSIÊ
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preencha os campos organizados por seções para alimentar o dossiê e o grafo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/tree")}
            className="rounded-2xl text-xs glass border-border/50"
          >
            Cancelar
          </Button>
          <motion.button
            type="submit"
            disabled={submitting || uploadingPhoto}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="rounded-2xl bg-ig-gradient hover:opacity-95 text-white shadow-md glow-ig-sm text-xs font-semibold px-5 h-10 gap-1.5 flex items-center cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>{isEdit ? "Salvar Alterações" : "Salvar Cadastro"}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Accordion with all 11 Sections */}
      <div className="space-y-4">
        {/* 1. DADOS BÁSICOS */}
        <FormSection
          id="basic"
          isOpen={openSections.basic}
          onToggle={() => toggleSection("basic")}
          hasError={sectionHasError("basic")}
          icon={<User className="size-4" />}
          iconBg="bg-primary/15 text-primary"
          title="1. Dados Básicos & Identificação"
        >
          {/* Foto e Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/20 border border-border/40">
            <IgAvatar
              src={watchedPhoto}
              alt="Preview da foto"
              fallback="FOTO"
              size="lg"
              fallbackClassName="text-base font-bold"
            />

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <Label className="text-xs font-semibold">Foto de Identificação</Label>
              <p className="text-[11px] text-muted-foreground">
                Envie uma imagem do indivíduo (JPG, PNG, WEBP). Limite de 10MB.
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-border/60 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors">
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5 text-primary" />
                        <span>{watchedPhoto ? "Substituir Imagem" : "Carregar Foto"}</span>
                      </>
                    )}
                  </div>
                </label>
                {watchedPhoto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("photo", "")}
                    className="h-8 rounded-xl text-xs text-destructive hover:bg-destructive/10"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Nome Completo e Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs">
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                placeholder="Ex: João da Silva"
                {...register("fullName")}
                className="rounded-xl glass border-border/60 text-sm"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="groupId" className="text-xs">
                Grupo / Organização
              </Label>
              <Select
                value={watch("groupId") || "NONE"}
                onValueChange={(val) => setValue("groupId", val === "NONE" ? "" : val)}
              >
                <SelectTrigger className="rounded-xl glass border-border/60 text-sm w-full">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                  <SelectItem value="NONE">Sem Grupo (Não Alocado)</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full inline-block"
                          style={{ backgroundColor: g.color }}
                        />
                        <span>{g.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aliases / Codinomes */}
          <div className="space-y-2">
            <Label className="text-xs">Alcunhas / Codinomes / Vulgos</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Adicionar apelido ou codinome..."
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAlias();
                  }
                }}
                className="rounded-xl glass border-border/60 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAlias}
                className="rounded-xl glass border-border/60 text-xs"
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {watchedAliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-mono"
                >
                  {alias}
                  <button
                    type="button"
                    onClick={() => handleRemoveAlias(idx)}
                    className="hover:text-destructive text-primary/70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Documentos Básicos (CPF, RG) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cpf" className="text-xs">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                {...register("cpf")}
                className="rounded-xl glass border-border/60 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rg" className="text-xs">RG</Label>
              <Input
                id="rg"
                placeholder="00.000.000-0"
                {...register("rg")}
                className="rounded-xl glass border-border/60 text-sm font-mono"
              />
            </div>
          </div>

          {/* Demografia (Gênero, Nascimento, Signo, Ocupação) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Gênero</Label>
              <Select
                value={watch("gender") || "NONE"}
                onValueChange={(val) =>
                  setValue("gender", val === "NONE" ? null : (val as any))
                }
              >
                <SelectTrigger className="rounded-xl glass border-border/60 text-sm w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                  <SelectItem value="NONE">Não Informado</SelectItem>
                  <SelectItem value="MALE">
                    <span className="flex items-center gap-1.5">
                      <GenderIcon gender="MALE" className="size-3.5" useBrandColor />
                      <span>Masculino</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="FEMALE">
                    <span className="flex items-center gap-1.5">
                      <GenderIcon gender="FEMALE" className="size-3.5" useBrandColor />
                      <span>Feminino</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="OTHER">
                    <span className="flex items-center gap-1.5">
                      <GenderIcon gender="OTHER" className="size-3.5" useBrandColor />
                      <span>Outro</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-xs">
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate")}
                className="rounded-xl glass border-border/60 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="zodiacSign" className="text-xs flex items-center justify-between">
                <span>Signo Zodiacal</span>
                {computedZodiacInfo ? (
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <span>{computedZodiacInfo.name}</span>
                    <ZodiacIcon sign={computedZodiacInfo.name} className="size-3.5" />
                  </span>
                ) : (
                  <span className="text-[10px] text-primary font-mono">Auto</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="zodiacSign"
                  placeholder="Calculado automaticamente"
                  {...register("zodiacSign")}
                  className="rounded-xl glass border-border/60 text-sm pr-9"
                />
                {computedZodiacInfo && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    <ZodiacIcon sign={computedZodiacInfo.name} className="size-4" />
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentJob" className="text-xs">Profissão / Ocupação</Label>
              <Input
                id="currentJob"
                placeholder="Ex: Empresário"
                {...register("currentJob")}
                className="rounded-xl glass border-border/60 text-sm"
              />
            </div>
          </div>

          {/* Notas / Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">Observações / Resumo Operacional</Label>
            <Textarea
              id="notes"
              placeholder="Anotações investigativas gerais sobre este alvo..."
              {...register("notes")}
              rows={3}
              className="rounded-xl glass border-border/60 text-sm resize-none"
            />
          </div>
        </FormSection>

        {/* 2. CONTATOS (Telefones e E-mails) */}
        <FormSection
          id="contacts"
          isOpen={openSections.contacts}
          onToggle={() => toggleSection("contacts")}
          hasError={sectionHasError("contacts")}
          icon={<Phone className="size-4" />}
          iconBg="bg-emerald-500/15 text-emerald-400"
          title="2. Telefones & E-mails"
        >
          {/* Telefones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-emerald-400" />
                Números de Telefone ({phonesArray.fields.length})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  phonesArray.append({ phone: "", label: "Principal", isWhatsapp: true, isTelegram: false })
                }
                className="h-8 text-xs rounded-xl glass text-emerald-400 gap-1"
              >
                <Plus className="size-3" />
                Adicionar Telefone
              </Button>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {phonesArray.fields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-2xl glass border border-border/40"
                  >
                    <Input
                      placeholder="+55 (11) 90000-0000"
                      {...register(`phones.${idx}.phone`)}
                      className="rounded-xl glass border-border/60 text-xs font-mono flex-1"
                    />
                    <Input
                      placeholder="Rótulo (ex: WhatsApp, Pessoal)"
                      {...register(`phones.${idx}.label`)}
                      className="rounded-xl glass border-border/60 text-xs w-full sm:w-40"
                    />
                    <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-muted/40 text-xs">
                      <span className="text-[11px] text-muted-foreground">WhatsApp:</span>
                      <Switch
                        checked={watch(`phones.${idx}.isWhatsapp`)}
                        onCheckedChange={(c) => setValue(`phones.${idx}.isWhatsapp`, c)}
                      />
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-muted/40 text-xs">
                      <span className="text-[11px] text-muted-foreground">Telegram:</span>
                      <Switch
                        checked={watch(`phones.${idx}.isTelegram`)}
                        onCheckedChange={(c) => setValue(`phones.${idx}.isTelegram`, c)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => phonesArray.remove(idx)}
                      className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* E-mails */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-indigo-400" />
                Endereços de E-mail ({emailsArray.fields.length})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => emailsArray.append({ email: "", label: "Principal" })}
                className="h-8 text-xs rounded-xl glass text-indigo-400 gap-1"
              >
                <Plus className="size-3" />
                Adicionar E-mail
              </Button>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {emailsArray.fields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 p-2.5 rounded-2xl glass border border-border/40"
                  >
                    <Input
                      type="email"
                      placeholder="nome@dominio.com"
                      {...register(`emails.${idx}.email`)}
                      className="rounded-xl glass border-border/60 text-xs font-mono flex-1"
                    />
                    <Input
                      placeholder="Rótulo (ex: Trabalho, Pessoal)"
                      {...register(`emails.${idx}.label`)}
                      className="rounded-xl glass border-border/60 text-xs w-36 sm:w-48"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => emailsArray.remove(idx)}
                      className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </FormSection>

        {/* 3. ENDEREÇOS (ViaCEP no Blur) */}
        <FormSection
          id="addresses"
          isOpen={openSections.addresses}
          onToggle={() => toggleSection("addresses")}
          hasError={sectionHasError("addresses")}
          icon={<MapPin className="size-4" />}
          iconBg="bg-rose-500/15 text-rose-400"
          title="3. Endereços & Localização (ViaCEP Auto-Fill)"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Digite o CEP e saia do campo (blur) para preenchimento automático.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                addressesArray.append({
                  label: "Residencial",
                  cep: "",
                  street: "",
                  number: "",
                  complement: "",
                  mapsUrl: "",
                  neighborhood: "",
                  city: "",
                  state: "",
                  country: "Brasil",
                })
              }
              className="h-8 text-xs rounded-xl glass text-rose-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Endereço
            </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {addressesArray.fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl glass border border-border/50 space-y-3 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <span className="text-xs font-semibold text-foreground">
                      Endereço #{idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addressesArray.remove(idx)}
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 rounded-lg px-2"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remover
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Rótulo</Label>
                      <Input
                        placeholder="Ex: Residencial, Sítio"
                        {...register(`addresses.${idx}.label`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">CEP (Auto-Fill)</Label>
                      <Input
                        placeholder="00000-000"
                        {...register(`addresses.${idx}.cep`)}
                        onBlur={(e) => handleCepBlur(idx, e.target.value)}
                        className="h-8 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[11px]">Logradouro / Rua</Label>
                      <Input
                        placeholder="Rua, Avenida..."
                        {...register(`addresses.${idx}.street`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px]">Número</Label>
                      <Input
                        placeholder="123"
                        {...register(`addresses.${idx}.number`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px]">Compl.</Label>
                      <Input
                        placeholder="Apto, Bloco"
                        {...register(`addresses.${idx}.complement`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px]">Bairro</Label>
                      <Input
                        placeholder="Bairro"
                        {...register(`addresses.${idx}.neighborhood`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px]">Cidade</Label>
                      <Input
                        placeholder="Cidade"
                        {...register(`addresses.${idx}.city`)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px]">UF</Label>
                      <Input
                        placeholder="SP"
                        maxLength={2}
                        {...register(`addresses.${idx}.state`)}
                        className="h-8 rounded-lg text-xs uppercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Redirecionamento Google Maps: Tipo 2 (Link Direto) */}
                  <div className="pt-3 border-t border-border/40 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <Label className="text-[11px] font-mono flex items-center gap-1.5 text-foreground font-semibold">
                        <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Link Direto Google Maps (Tipo 2 — Opcional)</span>
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Exemplo: https://maps.app.goo.gl/...
                      </span>
                    </div>

                    <Input
                      placeholder="https://maps.app.goo.gl/... (caso a busca normal erre o local)"
                      {...register(`addresses.${idx}.mapsUrl`)}
                      className="h-9 rounded-xl glass border-border/60 text-xs font-mono w-full"
                    />

                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      O <strong className="text-foreground/80">Tipo 1</strong> redireciona automaticamente com os dados do endereço acima. O <strong className="text-foreground/80">Tipo 2</strong> permite fixar o link direto para o ponto exato.
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 4. REDES SOCIAIS (Ícones de social-icons.tsx) */}
        <FormSection
          id="socials"
          isOpen={openSections.socials}
          onToggle={() => toggleSection("socials")}
          hasError={sectionHasError("socials")}
          icon={<Share2 className="size-4" />}
          iconBg="bg-purple-500/15 text-purple-400"
          title={`4. Redes Sociais & Contas Online (${socialsArray.fields.length})`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Vincule perfis das 19 plataformas suportadas para monitoramento.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                socialsArray.append({ platform: "instagram", username: "", url: "" })
              }
              className="h-8 text-xs rounded-xl glass text-purple-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Rede
            </Button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {socialsArray.fields.map((field, idx) => {
                const currentPlatform = watch(`socialProfiles.${idx}.platform`) || "instagram";
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl glass border border-border/40"
                  >
                    <div className="flex items-center gap-2 w-full sm:w-48">
                      <div className="size-8 rounded-xl glass flex items-center justify-center shrink-0 border border-border/60">
                        <SocialIcon platform={currentPlatform} className="size-4" useBrandColor />
                      </div>
                      <Select
                        value={currentPlatform}
                        onValueChange={(val) =>
                          setValue(`socialProfiles.${idx}.platform`, val)
                        }
                      >
                        <SelectTrigger className="h-9 rounded-xl glass text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass border-border/70 rounded-2xl max-h-64 backdrop-blur-xl">
                          {Object.entries(SOCIAL_BRANDS).map(([slug, brand]) => (
                            <SelectItem key={slug} value={slug}>
                              <div className="flex items-center gap-2">
                                <SocialIcon platform={slug} className="size-3.5" useBrandColor />
                                <span>{brand.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      placeholder={
                        currentPlatform === "website"
                          ? "URL do site (ex: https://meusite.com)"
                          : "@username ou identificador"
                      }
                      {...register(`socialProfiles.${idx}.username`)}
                      className="rounded-xl glass border-border/60 text-xs font-mono flex-1 w-full"
                    />

                    <Input
                      placeholder={
                        currentPlatform === "website"
                          ? "Link direto alternativo (opcional)"
                          : "URL do perfil (opcional)"
                      }
                      {...register(`socialProfiles.${idx}.url`)}
                      className="rounded-xl glass border-border/60 text-xs w-full sm:w-64"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => socialsArray.remove(idx)}
                      className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 5. DOCUMENTOS */}
        <FormSection
          id="documents"
          isOpen={openSections.documents}
          onToggle={() => toggleSection("documents")}
          hasError={sectionHasError("documents")}
          icon={<FileText className="size-4" />}
          iconBg="bg-amber-500/15 text-amber-400"
          title={`5. Documentos Catalogados (${documentsArray.fields.length})`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Documentos oficiais, registros e certidões.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                documentsArray.append({ type: "CNH" as any, value: "" })
              }
              className="h-8 text-xs rounded-xl glass text-amber-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Documento
            </Button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {documentsArray.fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-2xl glass border border-border/40"
                >
                  <Select
                    value={watch(`documents.${idx}.type`) || "CNH"}
                    onValueChange={(val) =>
                      setValue(`documents.${idx}.type`, val as any)
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl glass text-xs w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                      {DOCUMENT_TYPES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Número / Código do documento"
                    {...register(`documents.${idx}.value`)}
                    className="rounded-xl glass border-border/60 text-xs font-mono flex-1 w-full"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => documentsArray.remove(idx)}
                    className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 6. VEÍCULOS */}
        <FormSection
          id="vehicles"
          isOpen={openSections.vehicles}
          onToggle={() => toggleSection("vehicles")}
          hasError={sectionHasError("vehicles")}
          icon={<Car className="size-4" />}
          iconBg="bg-blue-500/15 text-blue-400"
          title={`6. Veículos & Automóveis (${vehiclesArray.fields.length})`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Placas, Renavam, Chassi e características automotivas.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                vehiclesArray.append({
                  placa: "",
                  renavam: "",
                  chassi: "",
                  motor: "",
                  marca: "",
                  modelo: "",
                  ano: null,
                  cor: "",
                })
              }
              className="h-8 text-xs rounded-xl glass text-blue-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Veículo
            </Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {vehiclesArray.fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 rounded-2xl glass border border-border/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/30">
                    <span className="text-xs font-semibold text-foreground">
                      Veículo #{idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => vehiclesArray.remove(idx)}
                      className="h-6 text-xs text-destructive hover:bg-destructive/10 rounded-lg px-2"
                    >
                      <Trash2 className="size-3 mr-1" /> Remover
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <Input
                      placeholder="Placa (ex: ABC1D23)"
                      {...register(`vehicles.${idx}.placa`)}
                      className="h-8 rounded-lg text-xs uppercase font-mono"
                    />
                    <Input
                      placeholder="Renavam"
                      {...register(`vehicles.${idx}.renavam`)}
                      className="h-8 rounded-lg text-xs font-mono"
                    />
                    <Input
                      placeholder="Marca (ex: Toyota)"
                      {...register(`vehicles.${idx}.marca`)}
                      className="h-8 rounded-lg text-xs"
                    />
                    <Input
                      placeholder="Modelo (ex: Corolla)"
                      {...register(`vehicles.${idx}.modelo`)}
                      className="h-8 rounded-lg text-xs"
                    />
                    <Input
                      placeholder="Ano"
                      type="number"
                      {...register(`vehicles.${idx}.ano`)}
                      className="h-8 rounded-lg text-xs font-mono"
                    />
                    <Input
                      placeholder="Cor"
                      {...register(`vehicles.${idx}.cor`)}
                      className="h-8 rounded-lg text-xs"
                    />
                    <Input
                      placeholder="Chassi"
                      {...register(`vehicles.${idx}.chassi`)}
                      className="h-8 rounded-lg text-xs font-mono sm:col-span-2"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 7. EMPREGOS */}
        <FormSection
          id="jobs"
          isOpen={openSections.jobs}
          onToggle={() => toggleSection("jobs")}
          hasError={sectionHasError("jobs")}
          icon={<Briefcase className="size-4" />}
          iconBg="bg-orange-500/15 text-orange-400"
          title={`7. Histórico Profissional & Empregos (${jobsArray.fields.length})`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Cargos, empresas e vínculos empregatícios.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                jobsArray.append({ title: "", company: "", cnpj: "", isCurrent: true })
              }
              className="h-8 text-xs rounded-xl glass text-orange-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Vínculo
            </Button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {jobsArray.fields.map((field, idx) => {
                const tradeName = watch(`jobs.${idx}.companyTradeName`);
                const capital = watch(`jobs.${idx}.companyCapital`);
                const legalNature = watch(`jobs.${idx}.companyLegalNature`);
                const size = watch(`jobs.${idx}.companySize`);
                const address = watch(`jobs.${idx}.companyAddress`);

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 rounded-2xl glass border border-border/40 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <Input
                        placeholder="Cargo / Função *"
                        {...register(`jobs.${idx}.title`)}
                        className="rounded-xl glass border-border/60 text-xs flex-1 w-full"
                      />
                      <Input
                        placeholder="Empresa / Razão Social"
                        {...register(`jobs.${idx}.company`)}
                        className="rounded-xl glass border-border/60 text-xs flex-1 w-full"
                      />
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <Input
                          placeholder="CNPJ"
                          {...register(`jobs.${idx}.cnpj`)}
                          className="rounded-xl glass border-border/60 text-xs font-mono w-full sm:w-36"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loadingCnpjIdx === idx}
                          onClick={() => handleCnpjLookup(idx)}
                          className="h-9 px-2 text-[10px] rounded-xl glass border-orange-500/40 text-orange-400 hover:text-orange-300 font-bold shrink-0 gap-1 shadow-xs"
                          title="Consultar dados da empresa na Receita via BrasilAPI"
                        >
                          {loadingCnpjIdx === idx ? (
                            <Loader2 className="size-3 animate-spin text-orange-400" />
                          ) : (
                            <Sparkles className="size-3 text-orange-400" />
                          )}
                          <span>OSINT</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-muted/40 text-xs shrink-0">
                        <span className="text-[11px] text-muted-foreground">Atual:</span>
                        <Switch
                          checked={watch(`jobs.${idx}.isCurrent`)}
                          onCheckedChange={(c) => setValue(`jobs.${idx}.isCurrent`, c)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => jobsArray.remove(idx)}
                        className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Inputs ocultos para persistir todos os dados enriquecidos */}
                    <input type="hidden" {...register(`jobs.${idx}.companyTradeName`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyLegalNature`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companySize`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyCapital`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyAddress`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyPhone`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyEmail`)} />
                    <input type="hidden" {...register(`jobs.${idx}.companyActivity`)} />

                    {/* OSINT Enriched Information Card (Persistente!) */}
                    {tradeName && (
                      <div className="p-2.5 rounded-xl bg-background/50 border border-orange-500/30 text-[11px] space-y-1 font-mono">
                        <div className="flex items-center justify-between text-orange-400 font-bold border-b border-border/30 pb-1 mb-1">
                          <span className="flex items-center gap-1">
                            <Sparkles className="size-3" />
                            <span>⚡ Dados Enriquecidos (BrasilAPI)</span>
                          </span>
                          {size && <span className="text-[10px] text-muted-foreground">Porte: {size}</span>}
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Razão Social:</span>
                          <span className="text-foreground font-semibold text-right truncate">
                            {tradeName}
                          </span>
                        </div>
                        {capital && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground shrink-0">Capital Social:</span>
                            <span className="text-emerald-400 font-semibold">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(capital))}
                            </span>
                          </div>
                        )}
                        {legalNature && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground shrink-0">Natureza Jurídica:</span>
                            <span className="text-foreground text-right truncate">{legalNature}</span>
                          </div>
                        )}
                        {address && (
                          <div className="text-[10px] text-muted-foreground pt-0.5">
                            Sede: {address}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 8. EDUCAÇÃO */}
        <FormSection
          id="educations"
          isOpen={openSections.educations}
          onToggle={() => toggleSection("educations")}
          hasError={sectionHasError("educations")}
          icon={<GraduationCap className="size-4" />}
          iconBg="bg-cyan-500/15 text-cyan-400"
          title={`8. Formação Acadêmica & Cursos (${educationsArray.fields.length})`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Instituições de ensino, graduações e especializações.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                educationsArray.append({
                  institution: "",
                  course: "",
                  degree: "",
                  startYear: null,
                  endYear: null,
                  isCurrent: false,
                })
              }
              className="h-8 text-xs rounded-xl glass text-cyan-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Formação
            </Button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {educationsArray.fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl glass border border-border/40"
                >
                  <Input
                    placeholder="Instituição *"
                    {...register(`educations.${idx}.institution`)}
                    className="rounded-xl glass border-border/60 text-xs flex-1 w-full"
                  />
                  <Input
                    placeholder="Curso / Área"
                    {...register(`educations.${idx}.course`)}
                    className="rounded-xl glass border-border/60 text-xs flex-1 w-full"
                  />
                  <Input
                    placeholder="Grau (ex: Bacharelado)"
                    {...register(`educations.${idx}.degree`)}
                    className="rounded-xl glass border-border/60 text-xs w-full sm:w-36"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => educationsArray.remove(idx)}
                    className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 9. FINANCEIRO (AES-256-GCM) */}
        <FormSection
          id="finances"
          isOpen={openSections.finances}
          onToggle={() => toggleSection("finances")}
          hasError={sectionHasError("finances")}
          icon={<CreditCard className="size-4" />}
          iconBg="bg-yellow-500/15 text-yellow-400"
          title={`9. Dados Financeiros & Contas (${financeArray.fields.length})`}
          badge={
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              AES-256-GCM
            </span>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Contas bancárias completas, cartões com gradiente e chaves são criptografados antes de salvar.
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  financeArray.append({
                    type: "BANK_ACCOUNT",
                    institution: "Nubank",
                    identifier: "",
                    metadata: {
                      bank: "Nubank",
                      agency: "",
                      accountNumber: "",
                      city: "",
                      state: "",
                    },
                  })
                }
                className="h-8 text-xs rounded-xl glass text-primary gap-1"
              >
                <Plus className="size-3" />
                Conta Bancária
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  financeArray.append({
                    type: "CREDIT_CARD",
                    institution: "visa",
                    identifier: "",
                    metadata: {
                      cardholderName: watch("fullName") || "NOME DO TITULAR",
                      cardNumber: "",
                      last4: "",
                      expiryDate: "",
                      cvc: "",
                      brand: "visa",
                      color: "azul",
                    },
                  })
                }
                className="h-8 text-xs rounded-xl glass text-emerald-400 gap-1"
              >
                <Plus className="size-3" />
                Cartão de Crédito
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  financeArray.append({
                    type: "PIX",
                    institution: "",
                    identifier: "",
                    metadata: null,
                  })
                }
                className="h-8 text-xs rounded-xl glass text-yellow-400 gap-1.5"
              >
                <PixKeyIcon className="size-3.5 text-yellow-400" />
                Chave PIX
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  financeArray.append({
                    type: "CRYPTO_WALLET",
                    institution: "BTC",
                    identifier: "",
                    metadata: { symbol: "BTC" },
                  })
                }
                className="h-8 text-xs rounded-xl glass text-sky-400 gap-1.5"
              >
                <CryptoIcon symbol="BTC" className="size-3.5" />
                Carteira Cripto
              </Button>
            </div>
          </div>

          <div className="space-y-3.5">
            <AnimatePresence>
              {financeArray.fields.map((field, idx) => {
                const currentType = watch(`financialAccounts.${idx}.type`) || "PIX";

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl glass border border-border/40 space-y-3"
                  >
                    {/* Linha superior: Tipo da Conta + Botão Remover */}
                    <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Select
                          value={currentType}
                          onValueChange={(val) => {
                            setValue(`financialAccounts.${idx}.type`, val as any);
                            if (val === "BANK_ACCOUNT" && !watch(`financialAccounts.${idx}.metadata.bank`)) {
                              setValue(`financialAccounts.${idx}.metadata`, {
                                bank: "Nubank",
                                agency: "",
                                accountNumber: "",
                                city: "",
                                state: "",
                              });
                              setValue(`financialAccounts.${idx}.institution`, "Nubank");
                            } else if (val === "CREDIT_CARD" && !watch(`financialAccounts.${idx}.metadata.brand`)) {
                              setValue(`financialAccounts.${idx}.metadata`, {
                                cardholderName: watch("fullName") || "NOME DO TITULAR",
                                cardNumber: "",
                                last4: "",
                                expiryDate: "",
                                cvc: "",
                                brand: "visa",
                                color: "azul",
                              });
                              setValue(`financialAccounts.${idx}.institution`, "visa");
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 rounded-xl glass text-xs font-semibold w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                            {FINANCE_TYPES.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => financeArray.remove(idx)}
                        className="size-7 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                        title="Remover conta"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* CONTA BANCÁRIA: 5 campos (Banco, Agência, Conta Corrente, Cidade, Estado) + 20 SVGs */}
                    {currentType === "BANK_ACCOUNT" && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
                          {/* Banco com 20 SVGs */}
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                              <span>Banco</span>
                              <BankIcon
                                bank={watch(`financialAccounts.${idx}.metadata.bank`) || watch(`financialAccounts.${idx}.institution`)}
                                className="size-3.5 shrink-0"
                              />
                            </Label>
                            <Select
                              value={
                                getBankInfo(watch(`financialAccounts.${idx}.metadata.bank`))?.id ||
                                getBankInfo(watch(`financialAccounts.${idx}.institution`))?.id ||
                                "nubank"
                              }
                              onValueChange={(val) => {
                                const info = getBankInfo(val);
                                const bankName = info?.name || val;
                                setValue(`financialAccounts.${idx}.institution`, bankName);
                                setValue(`financialAccounts.${idx}.metadata.bank`, bankName);
                                const ag = watch(`financialAccounts.${idx}.metadata.agency`) || "";
                                const cc = watch(`financialAccounts.${idx}.metadata.accountNumber`) || "";
                                const city = watch(`financialAccounts.${idx}.metadata.city`) || "";
                                const uf = watch(`financialAccounts.${idx}.metadata.state`) || "";
                                setValue(
                                  `financialAccounts.${idx}.identifier`,
                                  `Ag: ${ag} | CC: ${cc} - ${city}/${uf}`.trim() || bankName
                                );
                              }}
                            >
                              <SelectTrigger className="h-8 rounded-xl glass text-xs w-full">
                                <SelectValue placeholder="Selecione o banco" />
                              </SelectTrigger>
                              <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl max-h-60">
                                {BANKS_LIST.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    <div className="flex items-center gap-2">
                                      <BankIcon bank={b.id} className="size-4 shrink-0" />
                                      <span>{b.name}</span>
                                      <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                                        ({b.code})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Agência */}
                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">Agência</Label>
                            <Input
                              placeholder="0001"
                              value={watch(`financialAccounts.${idx}.metadata.agency`) || ""}
                              onChange={(e) => {
                                const ag = e.target.value;
                                setValue(`financialAccounts.${idx}.metadata.agency`, ag);
                                const bank = watch(`financialAccounts.${idx}.metadata.bank`) || watch(`financialAccounts.${idx}.institution`) || "";
                                const cc = watch(`financialAccounts.${idx}.metadata.accountNumber`) || "";
                                const city = watch(`financialAccounts.${idx}.metadata.city`) || "";
                                const uf = watch(`financialAccounts.${idx}.metadata.state`) || "";
                                setValue(`financialAccounts.${idx}.identifier`, `Ag: ${ag} | CC: ${cc} - ${city}/${uf}`.trim() || ag);
                              }}
                              className="h-8 rounded-xl glass text-xs font-mono"
                            />
                          </div>

                          {/* Conta Corrente */}
                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">Conta Corrente</Label>
                            <Input
                              placeholder="1234567-8"
                              value={watch(`financialAccounts.${idx}.metadata.accountNumber`) || ""}
                              onChange={(e) => {
                                const cc = e.target.value;
                                setValue(`financialAccounts.${idx}.metadata.accountNumber`, cc);
                                const ag = watch(`financialAccounts.${idx}.metadata.agency`) || "";
                                const city = watch(`financialAccounts.${idx}.metadata.city`) || "";
                                const uf = watch(`financialAccounts.${idx}.metadata.state`) || "";
                                setValue(`financialAccounts.${idx}.identifier`, `Ag: ${ag} | CC: ${cc} - ${city}/${uf}`.trim() || cc);
                              }}
                              className="h-8 rounded-xl glass text-xs font-mono"
                            />
                          </div>

                          {/* Cidade */}
                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">Cidade</Label>
                            <Input
                              placeholder="Cidade"
                              value={watch(`financialAccounts.${idx}.metadata.city`) || ""}
                              onChange={(e) => {
                                const city = e.target.value;
                                setValue(`financialAccounts.${idx}.metadata.city`, city);
                                const ag = watch(`financialAccounts.${idx}.metadata.agency`) || "";
                                const cc = watch(`financialAccounts.${idx}.metadata.accountNumber`) || "";
                                const uf = watch(`financialAccounts.${idx}.metadata.state`) || "";
                                setValue(`financialAccounts.${idx}.identifier`, `Ag: ${ag} | CC: ${cc} - ${city}/${uf}`.trim() || city);
                              }}
                              className="h-8 rounded-xl glass text-xs"
                            />
                          </div>

                          {/* Estado (UF) */}
                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">UF</Label>
                            <Input
                              placeholder="SP"
                              maxLength={2}
                              value={watch(`financialAccounts.${idx}.metadata.state`) || ""}
                              onChange={(e) => {
                                const uf = e.target.value.toUpperCase();
                                setValue(`financialAccounts.${idx}.metadata.state`, uf);
                                const ag = watch(`financialAccounts.${idx}.metadata.agency`) || "";
                                const cc = watch(`financialAccounts.${idx}.metadata.accountNumber`) || "";
                                const city = watch(`financialAccounts.${idx}.metadata.city`) || "";
                                setValue(`financialAccounts.${idx}.identifier`, `Ag: ${ag} | CC: ${cc} - ${city}/${uf}`.trim() || uf);
                              }}
                              className="h-8 rounded-xl glass text-xs uppercase font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARTÃO DE CRÉDITO: Redesign com Live Card Preview, Bandeiras e 7 Gradientes */}
                    {currentType === "CREDIT_CARD" && (
                      <div className="space-y-3.5 pt-1">
                        {/* Live Card Preview */}
                        <div className="flex justify-center py-1">
                          <CreditCardItem
                            data={{
                              cardholderName:
                                watch(`financialAccounts.${idx}.metadata.cardholderName`) ||
                                watch("fullName") ||
                                "NOME DO TITULAR",
                              cardNumber:
                                watch(`financialAccounts.${idx}.identifier`) ||
                                watch(`financialAccounts.${idx}.metadata.cardNumber`) ||
                                "0000 0000 0000 0000",
                              expiryDate:
                                watch(`financialAccounts.${idx}.metadata.expiryDate`) || "00/00",
                              cvc: watch(`financialAccounts.${idx}.metadata.cvc`) || "000",
                              brand:
                                watch(`financialAccounts.${idx}.metadata.brand`) ||
                                watch(`financialAccounts.${idx}.institution`) ||
                                "visa",
                              color: watch(`financialAccounts.${idx}.metadata.color`) || "azul",
                            }}
                            isRevealed={true}
                            showActions={false}
                          />
                        </div>

                        {/* Campos do Cartão */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[11px] font-mono text-muted-foreground">
                              Nome do Titular
                            </Label>
                            <Input
                              placeholder="Nome completo impresso no cartão"
                              value={watch(`financialAccounts.${idx}.metadata.cardholderName`) ?? ""}
                              onChange={(e) => {
                                const name = e.target.value.toUpperCase();
                                setValue(`financialAccounts.${idx}.metadata.cardholderName`, name);
                              }}
                              className="h-8 rounded-xl glass text-xs uppercase font-semibold"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[11px] font-mono text-muted-foreground">
                              Número do Cartão
                            </Label>
                            <Input
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              value={
                                watch(`financialAccounts.${idx}.metadata.cardNumber`) ||
                                watch(`financialAccounts.${idx}.identifier`) ||
                                ""
                              }
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                                const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
                                setValue(`financialAccounts.${idx}.metadata.cardNumber`, formatted);
                                setValue(`financialAccounts.${idx}.metadata.last4`, digits.slice(-4));
                                setValue(`financialAccounts.${idx}.identifier`, formatted);
                              }}
                              className="h-8 rounded-xl glass text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">
                              Validade (MM/AA)
                            </Label>
                            <Input
                              placeholder="MM/AA"
                              maxLength={5}
                              value={watch(`financialAccounts.${idx}.metadata.expiryDate`) || ""}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                if (val.length >= 3) {
                                  val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                }
                                setValue(`financialAccounts.${idx}.metadata.expiryDate`, val);
                              }}
                              className="h-8 rounded-xl glass text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">CVC</Label>
                            <Input
                              placeholder="000"
                              maxLength={4}
                              value={watch(`financialAccounts.${idx}.metadata.cvc`) || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                setValue(`financialAccounts.${idx}.metadata.cvc`, val);
                              }}
                              className="h-8 rounded-xl glass text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[11px] font-mono text-muted-foreground">
                              Bandeira do Cartão
                            </Label>
                            <Select
                              value={
                                watch(`financialAccounts.${idx}.metadata.brand`) ||
                                watch(`financialAccounts.${idx}.institution`) ||
                                "visa"
                              }
                              onValueChange={(val) => {
                                setValue(`financialAccounts.${idx}.metadata.brand`, val);
                                setValue(`financialAccounts.${idx}.institution`, val);
                              }}
                            >
                              <SelectTrigger className="h-8 rounded-xl glass text-xs">
                                <SelectValue placeholder="Selecione a bandeira" />
                              </SelectTrigger>
                              <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                                {CARD_BRANDS.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    <div className="flex items-center gap-2">
                                      <CardBrandLogo brand={b.id} className="h-4 w-auto shrink-0" />
                                      <span>{b.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Cor de Fundo Gradiente (7 Cores Obrigatórias) */}
                        <div className="space-y-1 pt-1 border-t border-border/30">
                          <Label className="text-[11px] font-mono text-muted-foreground block">
                            Cor Base do Cartão (Gradientes):
                          </Label>
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            {CARD_GRADIENTS.map((g) => {
                              const currentColor =
                                watch(`financialAccounts.${idx}.metadata.color`) || "azul";
                              const isSelected = currentColor === g.id;

                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() =>
                                    setValue(`financialAccounts.${idx}.metadata.color`, g.id)
                                  }
                                  style={{ background: g.cssGradient }}
                                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                      ? "ring-2 ring-primary ring-offset-2 scale-105 border-white shadow-md"
                                      : "border-white/20 opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  {isSelected && <Check className="size-3" />}
                                  <span>{g.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PIX (Com SVG de chave Pix) */}
                    {currentType === "PIX" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                          <PixKeyIcon className="size-4 text-emerald-400" />
                          <span>Chave PIX</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <Input
                            placeholder="Instituição / Banco (ex: Nubank, Inter, Caixa)"
                            {...register(`financialAccounts.${idx}.institution`)}
                            className="rounded-xl glass border-border/60 text-xs"
                          />
                          <Input
                            placeholder="Chave PIX (CPF, E-mail, Telefone, Chave Aleatória) *"
                            {...register(`financialAccounts.${idx}.identifier`)}
                            className="rounded-xl glass border-border/60 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* CARTEIRA CRIPTO (Com SVGs oficiais de BTC, ETH, SOL, BNB, XRP, USDT, USDC, XMR, BCH) */}
                    {currentType === "CRYPTO_WALLET" && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                          <CryptoIcon
                            symbol={
                              watch(`financialAccounts.${idx}.metadata.symbol`) ||
                              watch(`financialAccounts.${idx}.institution`) ||
                              "BTC"
                            }
                            className="size-4"
                          />
                          <span>Carteira de Criptomoeda</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1 sm:col-span-1">
                            <Label className="text-[11px] font-mono text-muted-foreground">Moeda / Cripto</Label>
                            <Select
                              value={
                                watch(`financialAccounts.${idx}.metadata.symbol`) ||
                                watch(`financialAccounts.${idx}.institution`) ||
                                "BTC"
                              }
                              onValueChange={(val) => {
                                setValue(`financialAccounts.${idx}.metadata.symbol`, val);
                                setValue(`financialAccounts.${idx}.institution`, val);
                              }}
                            >
                              <SelectTrigger className="h-8 rounded-xl glass text-xs font-semibold">
                                <SelectValue placeholder="Selecione a moeda" />
                              </SelectTrigger>
                              <SelectContent className="glass border-border/70 rounded-2xl backdrop-blur-xl">
                                {CRYPTO_LIST.map((c) => (
                                  <SelectItem key={c.symbol} value={c.symbol}>
                                    <div className="flex items-center gap-2">
                                      <CryptoIcon symbol={c.symbol} className="size-4 shrink-0" />
                                      <span className="font-bold">{c.symbol}</span>
                                      <span className="text-muted-foreground text-[10px]">({c.name})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[11px] font-mono text-muted-foreground">
                              Endereço Público da Carteira *
                            </Label>
                            <Input
                              placeholder="Endereço da carteira (ex: 0x..., bc1..., etc.)"
                              {...register(`financialAccounts.${idx}.identifier`)}
                              className="h-8 rounded-xl glass border-border/60 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 10. CREDENCIAIS (AES-256-GCM) */}
        <FormSection
          id="credentials"
          isOpen={openSections.credentials}
          onToggle={() => toggleSection("credentials")}
          hasError={sectionHasError("credentials")}
          icon={<Key className="size-4" />}
          iconBg="bg-red-500/15 text-red-400"
          title={`10. Credenciais & Vazamentos (${credentialsArray.fields.length})`}
          badge={
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
              COFRE CRIPTOGRAFADO
            </span>
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Credenciais expostas ou identificadas em vazamentos públicos.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                credentialsArray.append({
                  platform: "",
                  username: "",
                  passwordHash: "",
                  notes: "",
                })
              }
              className="h-8 text-xs rounded-xl glass text-red-400 gap-1"
            >
              <Plus className="size-3" />
              Adicionar Credencial
            </Button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence>
              {credentialsArray.fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl glass border border-border/40"
                >
                  <Input
                    placeholder="Plataforma / Serviço *"
                    {...register(`credentials.${idx}.platform`)}
                    className="rounded-xl glass border-border/60 text-xs w-full sm:w-40"
                  />

                  <Input
                    placeholder="Login / Usuário *"
                    {...register(`credentials.${idx}.username`)}
                    className="rounded-xl glass border-border/60 text-xs font-mono flex-1 w-full"
                  />

                  <Input
                    type="password"
                    placeholder="Senha / Hash / Segredo *"
                    {...register(`credentials.${idx}.passwordHash`)}
                    className="rounded-xl glass border-border/60 text-xs font-mono flex-1 w-full"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => credentialsArray.remove(idx)}
                    className="size-8 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* 11. FAMÍLIA & GENEALOGIA */}
        <FormSection
          id="family"
          isOpen={openSections.family}
          onToggle={() => toggleSection("family")}
          hasError={sectionHasError("family")}
          icon={<Users className="size-4" />}
          iconBg="bg-pink-500/15 text-pink-400"
          title="11. Família & Filiação (Pai, Mãe, Irmãos)"
        >
          {/* Pai */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-xs font-bold text-foreground">Filiação Paterna</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Vincular Pai Existente na Base</Label>
                <Select
                  value={watch("fatherId") || "NONE"}
                  onValueChange={(val) => setValue("fatherId", val === "NONE" ? "" : val)}
                >
                  <SelectTrigger className="h-9 rounded-xl glass text-xs w-full">
                    <SelectValue placeholder="Selecione um alvo cadastrado" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/70 rounded-2xl max-h-56 backdrop-blur-xl">
                    <SelectItem value="NONE">Nenhum (Entidade Externa / Não Cadastrada)</SelectItem>
                    {availableEntities
                      .filter((e) => e.id !== entityId)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Nome do Pai (Livre / Certidão)</Label>
                <Input
                  placeholder="Nome completo do pai..."
                  {...register("fatherName")}
                  className="h-9 rounded-xl glass text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mãe */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
            <span className="text-xs font-bold text-foreground">Filiação Materna</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Vincular Mãe Existente na Base</Label>
                <Select
                  value={watch("motherId") || "NONE"}
                  onValueChange={(val) => setValue("motherId", val === "NONE" ? "" : val)}
                >
                  <SelectTrigger className="h-9 rounded-xl glass text-xs w-full">
                    <SelectValue placeholder="Selecione um alvo cadastrado" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/70 rounded-2xl max-h-56 backdrop-blur-xl">
                    <SelectItem value="NONE">Nenhuma (Entidade Externa / Não Cadastrada)</SelectItem>
                    {availableEntities
                      .filter((e) => e.id !== entityId)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Nome da Mãe (Livre / Certidão)</Label>
                <Input
                  placeholder="Nome completo da mãe..."
                  {...register("motherName")}
                  className="h-9 rounded-xl glass text-xs"
                />
              </div>
            </div>
          </div>

          {/* Irmãos / Irmãs */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-foreground block">
              Irmãos & Irmãs (Vínculos ou Nomes Livres)
            </span>

            {/* Multi-select de entidades cadastradas */}
            <div className="space-y-1.5">
              <Label className="text-[11px]">Irmãos Cadastrados na Base</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/20 border border-border/40 max-h-48 overflow-y-auto">
                {availableEntities
                  .filter((e) => e.id !== entityId)
                  .map((e) => {
                    const selected = watchedSiblingIds.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggleSiblingId(e.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-all border",
                          selected
                            ? "bg-primary/15 border-primary/40 text-foreground font-semibold"
                            : "glass border-border/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "size-4 rounded-md border flex items-center justify-center shrink-0 text-white",
                            selected ? "bg-primary border-primary" : "border-border"
                          )}
                        >
                          {selected && <Check className="size-3" />}
                        </div>
                        <span className="truncate">{e.fullName}</span>
                      </button>
                    );
                  })}
                {availableEntities.length <= 1 && (
                  <span className="text-xs text-muted-foreground col-span-full italic">
                    Nenhuma outra pessoa cadastrada na base para vincular como irmão(ã).
                  </span>
                )}
              </div>
            </div>

            {/* Nomes Livres de Irmãos (SiblingName) */}
            <div className="space-y-2 pt-2">
              <Label className="text-[11px]">
                Nomes de Irmãos Adicionais (Não Cadastrados no Sistema)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome completo do irmão(ã)..."
                  value={newSiblingName}
                  onChange={(e) => setNewSiblingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSiblingName();
                    }
                  }}
                  className="rounded-xl glass border-border/60 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSiblingName}
                  className="rounded-xl glass border-border/60 text-xs"
                >
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {watchedSiblingNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-mono"
                  >
                    {typeof name === "string" ? name : (name as any)?.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveSiblingName(idx)}
                      className="hover:text-destructive text-pink-400/70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        {/* 12. MODO TEMPORÁRIO (BURNER MODE) */}
        <FormSection
          id="burner"
          isOpen={openSections.burner}
          onToggle={() => toggleSection("burner")}
          hasError={sectionHasError("burner")}
          icon={<Flame className="size-4" />}
          iconBg="bg-amber-500/10 text-amber-400"
          title="12. Alvo Temporário & Autodestruição (Burner Mode)"
          subtitle={
            watchedIsBurner
              ? "🔥 Ativo com expiração programada"
              : "Desativado (Registro permanente)"
          }
        >
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="isBurnerToggle"
                  className="text-xs font-bold text-foreground block font-mono"
                >
                  Ativar Autodestruição (Pessoa Temporária)
                </Label>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  Ao atingir o prazo, a entidade e seus arquivos serão
                  permanentemente apagados pelo worker.
                </p>
              </div>
              <Switch
                id="isBurnerToggle"
                checked={!!watchedIsBurner}
                onCheckedChange={(checked) => {
                  setValue("isBurner", checked);
                  if (checked && !watchedExpiresAt) {
                    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
                    setValue(
                      "expiresAt",
                      tomorrow.toISOString().slice(0, 16)
                    );
                  }
                }}
              />
            </div>

            {watchedIsBurner && (
              <div className="space-y-3 pt-3 border-t border-border/30 font-mono text-xs">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    Prazo de Validade / Expiração Rápida:
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(Date.now() + 1 * 3600 * 1000);
                        setValue(
                          "expiresAt",
                          date.toISOString().slice(0, 16)
                        );
                      }}
                      className="h-7 text-[10px] rounded-xl glass border-border/50 text-foreground"
                    >
                      1 Hora
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(Date.now() + 24 * 3600 * 1000);
                        setValue(
                          "expiresAt",
                          date.toISOString().slice(0, 16)
                        );
                      }}
                      className="h-7 text-[10px] rounded-xl glass border-border/50 text-foreground"
                    >
                      24 Horas (1 Dia)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(Date.now() + 7 * 24 * 3600 * 1000);
                        setValue(
                          "expiresAt",
                          date.toISOString().slice(0, 16)
                        );
                      }}
                      className="h-7 text-[10px] rounded-xl glass border-border/50 text-foreground"
                    >
                      7 Dias
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                        setValue(
                          "expiresAt",
                          date.toISOString().slice(0, 16)
                        );
                      }}
                      className="h-7 text-[10px] rounded-xl glass border-border/50 text-foreground"
                    >
                      30 Dias
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <Label
                    htmlFor="expiresAtInput"
                    className="text-[11px] text-muted-foreground"
                  >
                    Data e Hora Exata de Expiração:
                  </Label>
                  <Input
                    id="expiresAtInput"
                    type="datetime-local"
                    {...register("expiresAt")}
                    className="h-9 rounded-xl bg-background/50 border-border/50 font-mono text-xs text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </div>

      {/* Footer Submit Button */}
      <div className="pt-4 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/tree")}
          className="rounded-2xl text-xs glass border-border/50"
        >
          Cancelar
        </Button>
        <motion.button
          type="submit"
          disabled={submitting || uploadingPhoto}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          className="rounded-2xl bg-ig-gradient hover:opacity-95 text-white shadow-md glow-ig-sm text-xs font-semibold px-6 h-11 gap-1.5 flex items-center cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check className="size-4" />
              <span>{isEdit ? "Salvar Alterações" : "Salvar Cadastro"}</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
