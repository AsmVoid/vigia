/**
 * Utilitários para manipulação e formatação consistente de datas (especialmente data de nascimento).
 * Evita desvios de fuso horário (ex.: UTC vs UTC-3 / Brasil).
 */

export interface DateParts {
  year: number;
  month: number; // 1 - 12
  day: number;   // 1 - 31
}

/**
 * Extrai ano, mês e dia de uma data sem distorções de fuso horário.
 */
export function parseDateParts(
  input: string | Date | null | undefined
): DateParts | null {
  if (!input) return null;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Formato ISO: YYYY-MM-DD ou YYYY-MM-DDT...
    const matchIso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchIso) {
      return {
        year: parseInt(matchIso[1], 10),
        month: parseInt(matchIso[2], 10),
        day: parseInt(matchIso[3], 10),
      };
    }

    // Formato Brasileiro: DD/MM/YYYY
    const matchBr = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (matchBr) {
      return {
        year: parseInt(matchBr[3], 10),
        month: parseInt(matchBr[2], 10),
        day: parseInt(matchBr[1], 10),
      };
    }
  }

  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;

  // Como o Prisma armazena timestamp without time zone como UTC, usamos os componentes UTC
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Formata data de nascimento no padrão brasileiro DD/MM/AAAA de forma determinística.
 */
export function formatBirthDate(
  input: string | Date | null | undefined
): string | null {
  const parts = parseDateParts(input);
  if (!parts) return null;

  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");
  return `${day}/${month}/${parts.year}`;
}

/**
 * Calcula a idade de uma pessoa considerando a data de nascimento exata.
 */
export function calculateAge(
  input: string | Date | null | undefined
): number | null {
  const parts = parseDateParts(input);
  if (!parts) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  let age = currentYear - parts.year;
  if (
    currentMonth < parts.month ||
    (currentMonth === parts.month && currentDay < parts.day)
  ) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Calcula a contagem regressiva para o próximo aniversário.
 */
export function getBirthdayCountdown(
  input: string | Date | null | undefined
): string | null {
  const parts = parseDateParts(input);
  if (!parts) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBirthday = new Date(today.getFullYear(), parts.month - 1, parts.day);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, parts.month - 1, parts.day);
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "🎂 É hoje! Parabéns!";
  if (diffDays === 1) return "🎂 É amanhã!";
  return `🎂 em ${diffDays} dias`;
}
