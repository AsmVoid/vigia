export type ThemeMode = "black-oled" | "white-oled";

export interface SessionInfo {
  ip: string;
  provider?: string;
  city?: string;
  state?: string;
  country?: string;
  platform?: string;
  online: boolean;
}

export interface DashboardStats {
  totalPeople: number;
  totalGroups: number;
  ageDistribution: { group: string; count: number }[];
  genderDistribution: { gender: string; count: number; percentage: number }[];
  activityFlow: { date: string; positive: number; negative: number }[];
}
