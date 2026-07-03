export interface RoutePoint {
  lat: number;
  lon: number;
  ele: number;
  /** 累計距離（公尺） */
  dist: number;
}

export interface RouteData {
  name: string;
  points: RoutePoint[];
  distanceKm: number;
  elevationM: number;
  minEle: number;
  maxEle: number;
}

export type Theme = "dark" | "light";
export type Mode = "route" | "no-route";
export type Format = "post" | "story";

/** story 上下各 250px 會被 IG 系統介面蓋住，版面自動避開 */
export const STORY_SAFE = 250;

export const FORMATS: Record<Format, { label: string; w: number; h: number }> = {
  post: { label: "貼文 4:5", w: 1080, h: 1350 },
  story: { label: "限動 9:16", w: 1080, h: 1920 },
};

export interface PaceParams {
  /** 平路均速 km/h */
  flatSpeed: number;
  /** 爬升速率 m/h */
  climbRate: number;
  /** 每騎乘一小時的休息分鐘數 */
  restPerHour: number;
}

export const PACE_PRESETS: Record<string, { label: string; params: PaceParams }> = {
  easy: { label: "輕鬆", params: { flatSpeed: 18, climbRate: 400, restPerHour: 15 } },
  normal: { label: "一般", params: { flatSpeed: 22, climbRate: 500, restPerHour: 12 } },
  fast: { label: "進階", params: { flatSpeed: 26, climbRate: 650, restPerHour: 8 } },
};

export const ACCENTS: Record<string, { label: string; color: string }> = {
  orange: { label: "橘", color: "#FF6B00" },
  teal: { label: "青", color: "#2DD4BF" },
  pink: { label: "桃紅", color: "#F472B6" },
  lime: { label: "萊姆", color: "#A3E635" },
};

export interface GradientPreset {
  label: string;
  from: string;
  to: string;
}

export const GRADIENT_PRESETS: Record<string, GradientPreset> = {
  night: { label: "深夜藍", from: "#0F172A", to: "#1E3A5F" },
  sunrise: { label: "日出", from: "#3B0D2E", to: "#C2410C" },
  forest: { label: "森林", from: "#052E16", to: "#14532D" },
  graphite: { label: "石墨", from: "#18181B", to: "#3F3F46" },
};

export interface PosterData {
  title: string;
  meetTime: string;
  meetPlace: string;
  distanceKm: string;
  elevationM: string;
  timeText: string;
  caption: string;
  notes: string;
  theme: Theme;
  accent: string;
  mode: Mode;
  format: Format;
  bgPreset: string;
  bgImage: string | null;
  showProfile: boolean;
}

export const DEFAULT_POSTER: PosterData = {
  title: "週末約騎",
  meetTime: "7/12（六）6:30",
  meetPlace: "捷運劍南路站 2 號出口",
  distanceKm: "",
  elevationM: "",
  timeText: "",
  caption: "歡迎加入，限動私訊",
  notes: "",
  theme: "dark",
  accent: "orange",
  mode: "route",
  format: "post",
  bgPreset: "night",
  bgImage: null,
  showProfile: true,
};
