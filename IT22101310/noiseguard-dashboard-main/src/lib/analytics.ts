import { NoiseRecord, DailySummary, HourlyData } from "./types";

export function filterByDate(records: NoiseRecord[], date: string): NoiseRecord[] {
  return records.filter((r) => r.date === date);
}

export function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function computeRollingAverage(records: NoiseRecord[], window = 5): { time: string; avg_db: number; raw_db: number }[] {
  return records.map((r, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = records.slice(start, i + 1);
    const avg = slice.reduce((s, x) => s + x.avg_db, 0) / slice.length;
    return { time: r.time, avg_db: Math.round(avg * 10) / 10, raw_db: r.avg_db };
  });
}

export function computeDailySummary(todayRecords: NoiseRecord[], yesterdayRecords: NoiseRecord[]): DailySummary {
  const totalRecords = todayRecords.length;

  if (totalRecords === 0) {
    return {
      averageNoise: 0, totalRecords: 0, safetyScore: 100, peakDb: 0,
      peakTime: "--:--", dangerMinutes: 0, dangerCount: 0, normalCount: 0,
      warningCount: 0, yesterdayAverage: null, trendPercent: null,
    };
  }

  const averageNoise = Math.round((todayRecords.reduce((s, r) => s + r.avg_db, 0) / totalRecords) * 10) / 10;
  const peak = todayRecords.reduce((max, r) => (r.avg_db > max.avg_db ? r : max), todayRecords[0]);
  const dangerCount = todayRecords.filter((r) => r.status === "DANGER").length;
  const warningCount = todayRecords.filter((r) => r.status === "WARNING").length;
  const normalCount = todayRecords.filter((r) => r.status === "NORMAL").length;
  const dangerMinutes = dangerCount; // each record ≈ 1 minute
  const safetyScore = Math.max(0, 100 - dangerMinutes * 2);

  let yesterdayAverage: number | null = null;
  let trendPercent: number | null = null;
  if (yesterdayRecords.length > 0) {
    yesterdayAverage = Math.round((yesterdayRecords.reduce((s, r) => s + r.avg_db, 0) / yesterdayRecords.length) * 10) / 10;
    trendPercent = Math.round(((averageNoise - yesterdayAverage) / yesterdayAverage) * 1000) / 10;
  }

  return {
    averageNoise, totalRecords, safetyScore, peakDb: peak.avg_db,
    peakTime: peak.time, dangerMinutes, dangerCount, warningCount,
    normalCount, yesterdayAverage, trendPercent,
  };
}

export function computeHourlyData(records: NoiseRecord[]): HourlyData[] {
  const hourMap = new Map<number, { sum: number; count: number }>();
  for (const r of records) {
    const hour = parseInt(r.time.split(":")[0], 10);
    const entry = hourMap.get(hour) || { sum: 0, count: 0 };
    entry.sum += r.avg_db;
    entry.count += 1;
    hourMap.set(hour, entry);
  }
  return Array.from(hourMap.entries())
    .map(([hour, { sum, count }]) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      avgDb: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.hour - b.hour);
}

export function generateCSV(records: NoiseRecord[]): string {
  const header = "date,time,avg_db,status";
  const rows = records.map((r) => `${r.date},${r.time},${r.avg_db},${r.status}`);
  return [header, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "NORMAL": return "hsl(152, 69%, 41%)";
    case "WARNING": return "hsl(45, 93%, 47%)";
    case "DANGER": return "hsl(0, 72%, 51%)";
    default: return "hsl(215, 14%, 46%)";
  }
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return dates;
}
