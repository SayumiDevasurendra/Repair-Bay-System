import { NoiseRecord } from "@/lib/types";
import { filterByDate, getWeekDates } from "@/lib/analytics";

interface HeatmapProps {
  allRecords: NoiseRecord[];
}

const HeatmapComponent = ({ allRecords }: HeatmapProps) => {
  const weekDates = getWeekDates();
  const weekData = weekDates.map((date) => {
    const dayRecords = filterByDate(allRecords, date);
    const avg = dayRecords.length > 0
      ? Math.round((dayRecords.reduce((s, r) => s + r.avg_db, 0) / dayRecords.length) * 10) / 10
      : 0;
    const shortDate = date.slice(5); // MM-DD
    return { date: shortDate, avg, count: dayRecords.length };
  });

  const maxAvg = Math.max(...weekData.map((d) => d.avg), 1);

  function getHeatColor(avg: number): string {
    if (avg === 0) return "hsl(215, 20%, 95%)";
    const intensity = avg / maxAvg;
    if (intensity < 0.4) return "hsl(152, 69%, 41%)";
    if (intensity < 0.7) return "hsl(45, 93%, 47%)";
    return `hsl(0, ${Math.round(50 + intensity * 30)}%, ${Math.round(60 - intensity * 15)}%)`;
  }

  return (
    <div className="dashboard-card">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Weekly Heatmap
      </h3>
      <div className="flex gap-2">
        {weekData.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex h-16 w-full items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: getHeatColor(d.avg),
                color: d.avg === 0 ? "hsl(215, 14%, 46%)" : "white",
              }}
              title={`${d.date}: ${d.avg} dB avg (${d.count} records)`}
            >
              {d.avg > 0 ? d.avg : "—"}
            </div>
            <span className="text-[10px] text-muted-foreground">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapComponent;
