import type { LiftRecord } from "@/services/firebase";

export const mmToCm = (value: number) => value / 10;

export const calculateMovingAverage = (data: LiftRecord[], windowSize = 5) => {
  return data.map((val, idx, arr) => {
    const start = Math.max(0, idx - windowSize + 1);
    const subset = arr.slice(start, idx + 1);
    const sum = subset.reduce((a, b) => a + b.alignmentDiff, 0);
    return { ...val, smoothedDiff: sum / subset.length };
  });
};

export const getSafetyScore = (unsafeCount: number) => {
  return Math.max(0, 100 - unsafeCount * 5);
};

export const getTodayRecords = (records: LiftRecord[]) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return records.filter((r) => r.timestamp >= startOfDay);
};

export const getYesterdayRecords = (records: LiftRecord[]) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  return records.filter((r) => r.timestamp >= startOfYesterday && r.timestamp < startOfToday);
};

export const getAverageAlignment = (records: LiftRecord[]) => {
  if (records.length === 0) return 0;
  return records.reduce((sum, r) => sum + r.alignmentDiff, 0) / records.length;
};

export const getHourlyData = (records: LiftRecord[]) => {
  const hourly: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 24; i++) hourly[i] = { sum: 0, count: 0 };
  records.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    hourly[hour].sum += r.alignmentDiff;
    hourly[hour].count += 1;
  });
  return Object.entries(hourly).map(([hour, { sum, count }]) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    avg: count > 0 ? sum / count : 0,
    count,
  }));
};

export const getPeakError = (records: LiftRecord[]) => {
  if (records.length === 0) return null;
  return records.reduce((max, r) => (r.alignmentDiff > max.alignmentDiff ? r : max), records[0]);
};

export const formatTimestamp = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const exportToCSV = (records: LiftRecord[]) => {
  const header = "timestamp,leftDistance_cm,rightDistance_cm,alignmentDiff_cm,tiltX,tiltY,status\n";
  const rows = records
    .map(
      (r) =>
        `${new Date(r.timestamp).toISOString()},${mmToCm(r.leftDistance)},${mmToCm(r.rightDistance)},${mmToCm(r.alignmentDiff)},${r.tiltX},${r.tiltY},${r.status}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lift-safety-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
