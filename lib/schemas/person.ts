import { z } from "zod";

export const DocumentTypeEnum = z.enum([
  "CNS",
  "CNPJ",
  "PIS",
  "TITULO_ELEITOR",
  "PASSAPORTE",
  "CNH",
  "CERTIDAO_NASCIMENTO",
  "CERTIDAO_CASAMENTO",
]);

export const FinanceTypeEnum = z.enum([
  "BANK_ACCOUNT",
  "PIX",
  "CREDIT_CARD",
  "CRYPTO_WALLET",
]);

export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional();

const dateFieldSchema = z
  .union([z.string(), z.date()])
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().split("T")[0];
    const s = String(val).trim();
    return s.includes("T") ? s.split("T")[0] : s;
  });

export const EntityFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nome completo deve ter pelo menos 2 caracteres.")
    .max(150, "Máximo de 150 caracteres."),
  aliases: z.array(z.string().trim()).default([]),
  photo: z.string().trim().nullable().optional(),
  cpf: z.string().trim().nullable().optional(),
  rg: z.string().trim().nullable().optional(),
  gender: GenderEnum,
  birthDate: dateFieldSchema,
  zodiacSign: z.string().trim().nullable().optional(),
  currentJob: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  groupId: z.string().trim().nullable().optional(),
  isBurner: z.boolean().default(false),
  expiresAt: z.union([z.string(), z.date()]).nullable().optional().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().slice(0, 16);
    return String(val).trim();
  }),

  // Contatos (opcionais na criação/edição; validação só se preenchido)
  phones: z
    .array(
      z.object({
        id: z.string().optional(),
        phone: z.string().trim().optional().default(""),
        label: z.string().trim().default("Principal"),
        isWhatsapp: z.boolean().default(true),
        isTelegram: z.boolean().default(false),
      })
    )
    .default([]),

  emails: z
    .array(
      z.object({
        id: z.string().optional(),
        email: z.string().trim().optional().default(""),
        label: z.string().trim().default("Principal"),
      }).refine(
        (item) => {
          if (!item.email || item.email.trim() === "") return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email.trim());
        },
        {
          message: "E-mail inválido",
          path: ["email"],
        }
      )
    )
    .default([]),

  // Endereços
  addresses: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().trim().default("Residencial"),
        cep: z.string().trim().nullable().optional(),
        street: z.string().trim().nullable().optional(),
        number: z.string().trim().nullable().optional(),
        complement: z.string().trim().nullable().optional(),
        mapsUrl: z.string().trim().nullable().optional(),
        neighborhood: z.string().trim().nullable().optional(),
        city: z.string().trim().nullable().optional(),
        state: z.string().trim().nullable().optional(),
        country: z.string().trim().default("Brasil"),
      })
    )
    .default([]),

  // Redes Sociais
  socialProfiles: z
    .array(
      z.object({
        id: z.string().optional(),
        platform: z.string().trim().min(1, "Plataforma é obrigatória"),
        username: z.string().trim().min(1, "Usuário é obrigatório"),
        url: z.string().trim().nullable().optional(),
      })
    )
    .default([]),

  // Documentos
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        type: DocumentTypeEnum,
        value: z.string().trim().min(1, "Valor do documento é obrigatório"),
      })
    )
    .default([]),

  // Veículos
  vehicles: z
    .array(
      z.object({
        id: z.string().optional(),
        placa: z.string().trim().nullable().optional(),
        renavam: z.string().trim().nullable().optional(),
        chassi: z.string().trim().nullable().optional(),
        motor: z.string().trim().nullable().optional(),
        marca: z.string().trim().nullable().optional(),
        modelo: z.string().trim().nullable().optional(),
        ano: z.coerce.number().int().nullable().optional(),
        cor: z.string().trim().nullable().optional(),
      })
    )
    .default([]),

  // Empregos
  jobs: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1, "Cargo é obrigatório"),
        company: z.string().trim().nullable().optional(),
        cnpj: z.string().trim().nullable().optional(),
        companyTradeName: z.string().trim().nullable().optional(),
        companyLegalNature: z.string().trim().nullable().optional(),
        companySize: z.string().trim().nullable().optional(),
        companyCapital: z.union([z.string(), z.number()]).nullable().optional(),
        companyAddress: z.string().trim().nullable().optional(),
        companyPhone: z.string().trim().nullable().optional(),
        companyEmail: z.string().trim().nullable().optional(),
        companyActivity: z.string().trim().nullable().optional(),
        isCurrent: z.boolean().default(true),
      })
    )
    .default([]),

  // Educação
  educations: z
    .array(
      z.object({
        id: z.string().optional(),
        institution: z.string().trim().min(1, "Instituição é obrigatória"),
        course: z.string().trim().nullable().optional(),
        degree: z.string().trim().nullable().optional(),
        startYear: z.coerce.number().int().nullable().optional(),
        endYear: z.coerce.number().int().nullable().optional(),
        isCurrent: z.boolean().default(false),
      })
    )
    .default([]),

  // Financeiro
  financialAccounts: z
    .array(
      z.object({
        id: z.string().optional(),
        type: FinanceTypeEnum,
        institution: z.string().trim().nullable().optional(),
        identifier: z.string().trim().min(1, "Identificador/Chave é obrigatório"),
        metadata: z.record(z.string(), z.any()).nullable().optional(),
      })
    )
    .default([]),

  // Credenciais
  credentials: z
    .array(
      z.object({
        id: z.string().optional(),
        platform: z.string().trim().min(1, "Plataforma é obrigatória"),
        username: z.string().trim().min(1, "Usuário é obrigatório"),
        passwordHash: z.string().trim().min(1, "Senha/Hash é obrigatória"),
        notes: z.string().trim().nullable().optional(),
      })
    )
    .default([]),

  // Família
  fatherId: z.string().trim().nullable().optional(),
  fatherName: z.string().trim().nullable().optional(),
  motherId: z.string().trim().nullable().optional(),
  motherName: z.string().trim().nullable().optional(),
  siblingIds: z.array(z.string().trim()).default([]),
  siblingNames: z.array(z.string().trim()).default([]),
});

export type EntityFormData = z.infer<typeof EntityFormSchema>;
export type EntityFormInput = z.input<typeof EntityFormSchema>;
