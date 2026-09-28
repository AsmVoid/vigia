export interface ZodiacInfo {
  name: string;
  symbol: string;
  dateRange: string;
}

export const ZODIAC_SIGNS: Record<string, ZodiacInfo> = {
  "Áries": { name: "Áries", symbol: "♈", dateRange: "21 Mar - 19 Abr" },
  "Touro": { name: "Touro", symbol: "♉", dateRange: "20 Abr - 20 Mai" },
  "Gêmeos": { name: "Gêmeos", symbol: "♊", dateRange: "21 Mai - 20 Jun" },
  "Câncer": { name: "Câncer", symbol: "♋", dateRange: "21 Jun - 22 Jul" },
  "Leão": { name: "Leão", symbol: "♌", dateRange: "23 Jul - 22 Ago" },
  "Virgem": { name: "Virgem", symbol: "♍", dateRange: "23 Ago - 22 Set" },
  "Libra": { name: "Libra", symbol: "♎", dateRange: "23 Set - 22 Out" },
  "Escorpião": { name: "Escorpião", symbol: "♏", dateRange: "23 Out - 21 Nov" },
  "Sagitário": { name: "Sagitário", symbol: "♐", dateRange: "22 Nov - 21 Dez" },
  "Capricórnio": { name: "Capricórnio", symbol: "♑", dateRange: "22 Dez - 19 Jan" },
  "Aquário": { name: "Aquário", symbol: "♒", dateRange: "20 Jan - 18 Fev" },
  "Peixes": { name: "Peixes", symbol: "♓", dateRange: "19 Fev - 20 Mar" },
};

export function getZodiacInfo(dateInput: Date | string | null | undefined): ZodiacInfo | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  let day: number;
  let month: number;

  if (typeof dateInput === "string" && dateInput.includes("-")) {
    const parts = dateInput.split("T")[0].split("-");
    if (parts.length === 3) {
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      month = date.getUTCMonth() + 1;
      day = date.getUTCDate();
    }
  } else {
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  }

  let name = "Capricórnio";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) name = "Aquário";
  else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) name = "Peixes";
  else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) name = "Áries";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) name = "Touro";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) name = "Gêmeos";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) name = "Câncer";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) name = "Leão";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) name = "Virgem";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) name = "Libra";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) name = "Escorpião";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) name = "Sagitário";

  return ZODIAC_SIGNS[name] || null;
}

export function getZodiacSign(dateInput: Date | string | null | undefined): string {
  const info = getZodiacInfo(dateInput);
  return info ? info.name : "";
}

export function getZodiacBadge(signNameOrInput: string | null | undefined): ZodiacInfo | null {
  if (!signNameOrInput) return null;
  // If it matches a sign name directly
  if (ZODIAC_SIGNS[signNameOrInput]) return ZODIAC_SIGNS[signNameOrInput];
  // Check if signNameOrInput contains any of the sign names
  for (const key of Object.keys(ZODIAC_SIGNS)) {
    if (signNameOrInput.includes(key)) {
      return ZODIAC_SIGNS[key];
    }
  }
  return getZodiacInfo(signNameOrInput);
}
