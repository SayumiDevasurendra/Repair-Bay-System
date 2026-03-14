import { useEffect, useState, useRef } from "react";
import { startSession, subscribeLiftLogs, type LiftRecord } from "@/services/firebase";
import {
  calculateMovingAverage,
  getSafetyScore,
  getTodayRecords,
  getYesterdayRecords,
  getAverageAlignment,
  getHourlyData,
  getPeakError,
  formatTimestamp,
} from "@/utils/analytics";
import MetricCard from "@/components/MetricCard";
import StatusCard from "@/components/StatusCard";
import AlignmentChart from "@/components/AlignmentChart";
import TiltChart from "@/components/TiltChart";
import SafetyScore from "@/components/SafetyScore";
import PieChartComponent from "@/components/PieChartComponent";
import HourlyRiskChart from "@/components/HourlyRiskChart";
import IncidentTable from "@/components/IncidentTable";
import ExportButton from "@/components/ExportButton";
import { Activity, ArrowDown, ArrowUp, AlertTriangle, Ruler, RotateCcw } from "lucide-react";

const Dashboard = () => {
  const [records, setRecords] = useState<LiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevUnsafeCount = useRef(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        await startSession();
        unsubscribe = subscribeLiftLogs((data) => {
          setRecords(data);
          setLoading(false);
        });
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => unsubscribe?.();
  }, []);

  // Browser notifications for unsafe events
  useEffect(() => {
    const todayRecs = getTodayRecords(records);
    const unsafeCount = todayRecs.filter((r) => r.status === "UNSAFE").length;
    if (unsafeCount > prevUnsafeCount.current && prevUnsafeCount.current > 0) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("⚠ Lift Misalignment Detected", {
          body: `Unsafe event recorded. Total today: ${unsafeCount}`,
        });
      }
    }
    prevUnsafeCount.current = unsafeCount;
  }, [records]);

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;
  const todayRecords = getTodayRecords(records);
  const yesterdayRecords = getYesterdayRecords(records);
  const unsafeToday = todayRecords.filter((r) => r.status === "UNSAFE").length;
  const safeToday = todayRecords.filter((r) => r.status === "SAFE").length;
  const safetyScore = getSafetyScore(unsafeToday);
  const smoothedData = calculateMovingAverage(todayRecords.length > 0 ? todayRecords : records.slice(-100));
  const hourlyData = getHourlyData(todayRecords);
  const peakError = getPeakError(todayRecords);

  const todayAvg = getAverageAlignment(todayRecords);
  const yesterdayAvg = getAverageAlignment(yesterdayRecords);
  const trendPct = yesterdayAvg > 0 ? ((todayAvg - yesterdayAvg) / yesterdayAvg) * 100 : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-mono text-sm">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="card-surface p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-status-unsafe mx-auto mb-4" />
          <h2 className="text-foreground font-bold mb-2">Connection Error</h2>
          <p className="text-muted-foreground text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">LIFTSAFE MONITOR</h1>
            <p className="text-xs text-muted-foreground font-mono">
              SYSTEM_STATUS: {latestRecord?.status === "UNSAFE" ? "CRITICAL_ALIGNMENT" : "OPERATIONAL"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unsafeToday > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-status-unsafe/20 status-unsafe-text text-xs font-bold font-mono animate-pulse-unsafe">
              <AlertTriangle className="w-3.5 h-3.5" />
              {unsafeToday} UNSAFE TODAY
            </span>
          )}
          <ExportButton records={todayRecords.length > 0 ? todayRecords : records} />
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricCard
          label="Left Distance"
          value={latestRecord?.leftDistance ?? 0}
          unit="mm"
          icon={<Ruler className="w-4 h-4" />}
        />
        <MetricCard
          label="Right Distance"
          value={latestRecord?.rightDistance ?? 0}
          unit="mm"
          icon={<Ruler className="w-4 h-4" />}
        />
        <MetricCard
          label="Alignment Diff"
          value={latestRecord?.alignmentDiff ?? 0}
          unit="mm"
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard
          label="Tilt (X / Y)"
          value={`${(latestRecord?.tiltX ?? 0).toFixed(1)}° / ${(latestRecord?.tiltY ?? 0).toFixed(1)}°`}
          unit=""
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <div className="lg:col-span-2">
          <AlignmentChart data={smoothedData} />
        </div>
        <div className="grid grid-rows-2 gap-3">
          <SafetyScore score={safetyScore} />
          <PieChartComponent safeCount={safeToday} unsafeCount={unsafeToday} />
        </div>
      </div>

      {/* Status + Trend + Peak Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <StatusCard record={latestRecord} />

        <div className="card-surface p-4 flex flex-col justify-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-2">Alignment Trend</p>
          <div className="flex items-center gap-2">
            {trendPct > 0 ? (
              <ArrowUp className="w-5 h-5 status-unsafe-text" />
            ) : (
              <ArrowDown className="w-5 h-5 status-safe-text" />
            )}
            <span className={`text-xl font-bold font-mono tabular-nums ${trendPct > 0 ? "status-unsafe-text" : "status-safe-text"}`}>
              {trendPct > 0 ? "+" : ""}{trendPct.toFixed(1)}%
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            {trendPct > 0 ? "Worse" : "Better"} alignment than yesterday
          </p>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            Today: {todayAvg.toFixed(2)} mm | Yesterday: {yesterdayAvg.toFixed(2)} mm
          </div>
        </div>

        <div className="card-surface p-4 flex flex-col justify-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-2">Peak Error Today</p>
          {peakError ? (
            <>
              <span className="text-xl font-bold font-mono tabular-nums status-unsafe-text">
                {peakError.alignmentDiff.toFixed(2)} mm
              </span>
              <p className="text-muted-foreground text-xs mt-1 font-mono">
                at {formatTimestamp(peakError.timestamp)}
              </p>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">No data today</span>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <TiltChart data={(todayRecords.length > 0 ? todayRecords : records.slice(-100))} />
        <HourlyRiskChart data={hourlyData} />
      </div>

      {/* Incident Table */}
      <IncidentTable records={todayRecords.length > 0 ? todayRecords : records} />
    </div>
  );
};

export default Dashboard;
