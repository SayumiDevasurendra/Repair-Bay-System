export type NoiseStatus = "NORMAL" | "WARNING" | "DANGER";

export interface NoiseRecord {
  key: string;
  avg_db: number;
  status: NoiseStatus;
  date: string;
  time: string;
}

export interface DailySummary {
  averageNoise: number;
  totalRecords: number;
  safetyScore: number;
  peakDb: number;
  peakTime: string;
  dangerMinutes: number;
  dangerCount: number;
  normalCount: number;
  warningCount: number;
  yesterdayAverage: number | null;
  trendPercent: number | null;
}

export interface HourlyData {
  hour: number;
  label: string;
  avgDb: number;
  count: number;
}
