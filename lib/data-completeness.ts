export interface EntityCompletenessInput {
  photo?: string | null;
  cpf?: string | null;
  rg?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  currentJob?: string | null;
  notes?: string | null;
  _count?: {
    phones?: number;
    emails?: number;
    addresses?: number;
    socialProfiles?: number;
    documents?: number;
  };
}

export function calculateDataCompleteness(entity: EntityCompletenessInput): number {
  let score = 0;
  const TOTAL_CRITERIA = 12;

  if (entity.photo && entity.photo.trim() !== "") score++;
  if (entity.cpf && entity.cpf.trim() !== "") score++;
  if (entity.rg && entity.rg.trim() !== "") score++;
  if (entity.birthDate) score++;
  if (entity.gender) score++;
  if (entity.currentJob && entity.currentJob.trim() !== "") score++;
  if (entity.notes && entity.notes.trim() !== "") score++;

  if (entity._count) {
    if ((entity._count.phones ?? 0) > 0) score++;
    if ((entity._count.emails ?? 0) > 0) score++;
    if ((entity._count.addresses ?? 0) > 0) score++;
    if ((entity._count.socialProfiles ?? 0) > 0) score++;
    if ((entity._count.documents ?? 0) > 0) score++;
  }

  return Math.round((score / TOTAL_CRITERIA) * 100);
}
