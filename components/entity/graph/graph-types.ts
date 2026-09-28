import { RelationshipType } from "@/generated/prisma/enums";

export type GraphCategory =
  | "ROMANCE"
  | "FAMILY"
  | "PROFESSIONAL"
  | "SOCIAL"
  | "INVESTIGATIVE";

export interface RolePreset {
  label: string;
  category: GraphCategory;
  prismaType: RelationshipType;
  description?: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  // 1. AFETIVO / ROMANCE
  { label: "Esposa", category: "ROMANCE", prismaType: "SPOUSE", description: "Cônjuge feminino" },
  { label: "Marido", category: "ROMANCE", prismaType: "SPOUSE", description: "Cônjuge masculino" },
  { label: "Namorado(a)", category: "ROMANCE", prismaType: "SPOUSE", description: "Relacionamento afetivo" },
  { label: "Noivo(a)", category: "ROMANCE", prismaType: "SPOUSE", description: "Compromisso de casamento" },
  { label: "Ex-Cônjuge", category: "ROMANCE", prismaType: "SPOUSE", description: "Divorciado(a) ou separado(a)" },
  { label: "Ex-Namorado(a)", category: "ROMANCE", prismaType: "SPOUSE", description: "Término de relacionamento" },
  { label: "Amante / Caso", category: "ROMANCE", prismaType: "OTHER", description: "Relação extraconjugal ou pontual" },

  // 2. FAMÍLIA
  { label: "Pai", category: "FAMILY", prismaType: "FATHER", description: "Ascendente paterno" },
  { label: "Mãe", category: "FAMILY", prismaType: "MOTHER", description: "Ascendente materno" },
  { label: "Filho(a)", category: "FAMILY", prismaType: "CHILD", description: "Descendente direto" },
  { label: "Irmão(ã)", category: "FAMILY", prismaType: "SIBLING", description: "Mesmo núcleo familiar" },
  { label: "Avô(ó)", category: "FAMILY", prismaType: "GRANDPARENT", description: "Segunda geração ascendente" },
  { label: "Neto(a)", category: "FAMILY", prismaType: "CHILD", description: "Segunda geração descendente" },
  { label: "Tio(a)", category: "FAMILY", prismaType: "OTHER", description: "Irmão(ã) dos pais" },
  { label: "Sobrinho(a)", category: "FAMILY", prismaType: "OTHER", description: "Filho(a) de irmão(ã)" },
  { label: "Primo(a)", category: "FAMILY", prismaType: "OTHER", description: "Parente colateral" },
  { label: "Enteado(a)", category: "FAMILY", prismaType: "CHILD", description: "Filho(a) do cônjuge" },
  { label: "Padrasto", category: "FAMILY", prismaType: "FATHER", description: "Cônjuge da mãe" },
  { label: "Madrasta", category: "FAMILY", prismaType: "MOTHER", description: "Cônjuge do pai" },
  { label: "Cunhado(a)", category: "FAMILY", prismaType: "OTHER", description: "Irmão(ã) do cônjuge" },
  { label: "Sogro(a)", category: "FAMILY", prismaType: "OTHER", description: "Pai/mãe do cônjuge" },
  { label: "Parente", category: "FAMILY", prismaType: "OTHER", description: "Vínculo familiar geral" },

  // 3. PROFISSIONAL / TRABALHO
  { label: "Colega de Trabalho", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Mesma empresa ou setor" },
  { label: "Chefe / Superior", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Hierarquia superior" },
  { label: "Subordinado(a)", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Equipe liderada" },
  { label: "Sócio(a)", category: "PROFESSIONAL", prismaType: "BUSINESS_PARTNER", description: "Quadro societário (QSA)" },
  { label: "Advogado(a)", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Representante legal" },
  { label: "Contador(a)", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Gestão contábil/fiscal" },
  { label: "Empregado(a)", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Funcionário contratado" },
  { label: "Empregador(a)", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Contratante direto" },
  { label: "Parceiro de Negócios", category: "PROFESSIONAL", prismaType: "BUSINESS_PARTNER", description: "Acordos comerciais conjuntos" },
  { label: "Cliente", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Comprador ou contratante" },
  { label: "Fornecedor", category: "PROFESSIONAL", prismaType: "COLLEAGUE", description: "Provedor de insumos/serviços" },

  // 4. SOCIAL / CONVIVÊNCIA
  { label: "Amigo(a)", category: "SOCIAL", prismaType: "FRIEND", description: "Vínculo de amizade" },
  { label: "Melhor Amigo(a)", category: "SOCIAL", prismaType: "FRIEND", description: "Amizade íntima e frequente" },
  { label: "Vizinho(a)", category: "SOCIAL", prismaType: "FRIEND", description: "Proximidade de residência" },
  { label: "Conhecido(a)", category: "SOCIAL", prismaType: "FRIEND", description: "Contato ocasional" },
  { label: "Colega de Quarto", category: "SOCIAL", prismaType: "FRIEND", description: "Divide mesma residência" },
  { label: "Colega de Estudos", category: "SOCIAL", prismaType: "FRIEND", description: "Faculdade, curso ou escola" },

  // 5. INVESTIGATIVO / V.I.G.I.A
  { label: "Comparsa", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Vínculo em atividades ilícitas" },
  { label: "Co-autor", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Participação conjunta em evento" },
  { label: "Suspeito Relacionado", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Investigado conectado" },
  { label: "Testemunha", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Depoente ou declarante" },
  { label: "Vítima", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Parte lesada ou ofendida" },
  { label: "Informante", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Fonte humana de informação" },
  { label: "Rival / Inimigo", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Conflito, ameaça ou rivalidade" },
  { label: "Operador Financeiro", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Movimentação de fundos/laranja" },
  { label: "Contato Frequente", category: "INVESTIGATIVE", prismaType: "OTHER", description: "Alto volume de ligações/mensagens" },
];

export interface CategoryConfig {
  key: GraphCategory;
  name: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  stroke: string;
  dasharray?: string;
  iconName: "heart" | "users" | "briefcase" | "flame" | "shield-alert";
}

export const CATEGORY_CONFIGS: Record<GraphCategory, CategoryConfig> = {
  ROMANCE: {
    key: "ROMANCE",
    name: "Afetivo / Amoroso",
    color: "#f43f5e", // Rose / Red glow
    glowColor: "rgba(244, 63, 94, 0.4)",
    badgeBg: "bg-rose-500/15 dark:bg-rose-950/40",
    badgeText: "text-rose-600 dark:text-rose-400",
    badgeBorder: "border-rose-500/30",
    stroke: "#f43f5e",
    dasharray: undefined,
    iconName: "heart",
  },
  FAMILY: {
    key: "FAMILY",
    name: "Família",
    color: "#e1306c", // Instagram magenta / pink
    glowColor: "rgba(225, 48, 108, 0.4)",
    badgeBg: "bg-pink-500/15 dark:bg-pink-950/40",
    badgeText: "text-pink-600 dark:text-pink-400",
    badgeBorder: "border-pink-500/30",
    stroke: "#e1306c",
    dasharray: undefined,
    iconName: "users",
  },
  PROFESSIONAL: {
    key: "PROFESSIONAL",
    name: "Trabalho / Negócios",
    color: "#f59e0b", // Amber / Gold
    glowColor: "rgba(245, 158, 11, 0.35)",
    badgeBg: "bg-amber-500/15 dark:bg-amber-950/40",
    badgeText: "text-amber-600 dark:text-amber-300",
    badgeBorder: "border-amber-500/30",
    stroke: "#f59e0b",
    dasharray: "3,3",
    iconName: "briefcase",
  },
  SOCIAL: {
    key: "SOCIAL",
    name: "Social / Amizade",
    color: "#8b5cf6", // Purple / Violet
    glowColor: "rgba(139, 92, 246, 0.35)",
    badgeBg: "bg-purple-500/15 dark:bg-purple-950/40",
    badgeText: "text-purple-600 dark:text-purple-300",
    badgeBorder: "border-purple-500/30",
    stroke: "#8b5cf6",
    dasharray: "6,6",
    iconName: "users",
  },
  INVESTIGATIVE: {
    key: "INVESTIGATIVE",
    name: "Investigativo / V.I.G.I.A",
    color: "#ef4444", // Red Alert
    glowColor: "rgba(239, 68, 68, 0.4)",
    badgeBg: "bg-red-500/15 dark:bg-red-950/40",
    badgeText: "text-red-600 dark:text-red-400",
    badgeBorder: "border-red-500/30",
    stroke: "#ef4444",
    dasharray: "8,4,2,4",
    iconName: "shield-alert",
  },
};

export function inferCategoryFromRole(roleLabel?: string | null, prismaType?: RelationshipType | null): GraphCategory {
  if (!roleLabel && !prismaType) return "SOCIAL";

  const clean = (roleLabel || "").toLowerCase().trim();

  // Romance check
  if (
    clean.includes("espos") ||
    clean.includes("marid") ||
    clean.includes("namorad") ||
    clean.includes("noiv") ||
    clean.includes("amante") ||
    clean.includes("cônjuge") ||
    clean.includes("conjuge")
  ) {
    return "ROMANCE";
  }

  // Family check
  if (
    clean.includes("pai") ||
    clean.includes("mãe") ||
    clean.includes("mae") ||
    clean.includes("filh") ||
    clean.includes("irmã") ||
    clean.includes("irma") ||
    clean.includes("avô") ||
    clean.includes("avo") ||
    clean.includes("net") ||
    clean.includes("tio") ||
    clean.includes("sobrinh") ||
    clean.includes("prim") ||
    clean.includes("entead") ||
    clean.includes("padrast") ||
    clean.includes("madrast") ||
    clean.includes("cunhad") ||
    clean.includes("sogr") ||
    clean.includes("parent")
  ) {
    return "FAMILY";
  }

  // Professional check
  if (
    clean.includes("trabalh") ||
    clean.includes("chef") ||
    clean.includes("subordin") ||
    clean.includes("sóci") ||
    clean.includes("soci") ||
    clean.includes("advogad") ||
    clean.includes("contador") ||
    clean.includes("empregad") ||
    clean.includes("empregador") ||
    clean.includes("fornecedor") ||
    clean.includes("cliente") ||
    clean.includes("empresa") ||
    clean.includes("negócio")
  ) {
    return "PROFESSIONAL";
  }

  // Investigative check
  if (
    clean.includes("comparsa") ||
    clean.includes("co-autor") ||
    clean.includes("coautor") ||
    clean.includes("suspeit") ||
    clean.includes("testemunh") ||
    clean.includes("vítim") ||
    clean.includes("vitim") ||
    clean.includes("informant") ||
    clean.includes("rival") ||
    clean.includes("inimig") ||
    clean.includes("laranja") ||
    clean.includes("operador")
  ) {
    return "INVESTIGATIVE";
  }

  // Fallback to prismaType
  switch (prismaType) {
    case "FATHER":
    case "MOTHER":
    case "CHILD":
    case "SIBLING":
    case "GRANDPARENT":
      return "FAMILY";
    case "SPOUSE":
      return "ROMANCE";
    case "BUSINESS_PARTNER":
    case "COLLEAGUE":
      return "PROFESSIONAL";
    case "FRIEND":
      return "SOCIAL";
    case "OTHER":
    default:
      return "SOCIAL";
  }
}

export function mapRoleToPrismaType(roleLabel: string, category: GraphCategory): RelationshipType {
  const match = ROLE_PRESETS.find(
    (p) => p.label.toLowerCase() === roleLabel.toLowerCase().trim()
  );
  if (match) return match.prismaType;

  switch (category) {
    case "ROMANCE":
      return "SPOUSE";
    case "FAMILY":
      return "OTHER";
    case "PROFESSIONAL":
      return "COLLEAGUE";
    case "SOCIAL":
      return "FRIEND";
    case "INVESTIGATIVE":
    default:
      return "OTHER";
  }
}

export interface DetailedEntityData {
  id: string;
  fullName: string;
  aliases?: string[];
  photo?: string | null;
  gender?: string | null;
  birthDate?: string | Date | null;
  zodiacSign?: string | null;
  cpf?: string | null;
  rg?: string | null;
  currentJob?: string | null;
  notes?: string | null;
  riskScore?: number;
  dataCompleteness?: number;
  groupName?: string | null;
  groupColor?: string | null;
  primaryPhone?: string | null;
  hasWhatsapp?: boolean;
  hasTelegram?: boolean;
  city?: string | null;
  state?: string | null;
  company?: string | null;
  vehiclesCount?: number;
  phonesCount?: number;
  emailsCount?: number;
  addressesCount?: number;
  connectionsCount?: number;
  isRegistered?: boolean;
  role?: string;
  category?: GraphCategory;
  relationshipId?: string;
  relNotes?: string | null;
  isCentral?: boolean;
}
