import { useMemo } from "react";
import { useNoiseData } from "@/hooks/useNoiseData";
import { filterByDate, getTodayDateStr, getYesterdayDateStr, computeRollingAverage, computeDailySummary, computeHourlyData, generateCSV, downloadCSV } from "@/lib/analytics";
import StatusCard from "@/components/dashboard/StatusCard";
import SummaryCard from "@/components/dashboard/SummaryCard";
import LineChartComponent from "@/components/dashboard/LineChartComponent";
import PieChartComponent from "@/components/dashboard/PieChartComponent";
import HourlyChartComponent from "@/components/dashboard/HourlyChartComponent";
import HeatmapComponent from "@/components/dashboard/HeatmapComponent";
import IncidentTable from "@/components/dashboard/IncidentTable";
import SafetyScoreGauge from "@/components/dashboard/SafetyScoreGauge";
import { Volume2, TrendingUp, TrendingDown, AlertTriangle, Clock, Download, BarChart3, Activity } from "lucide-react";

const Index = () => {
  const { allRecords, loading, newDanger, clearDangerAlert } = useNoiseData();

  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  const todayRecords = useMemo(() => filterByDate(allRecords, today), [allRecords, today]);
  const yesterdayRecords = useMemo(() => filterByDate(allRecords, yesterday), [allRecords, yesterday]);
  const summary = useMemo(() => computeDailySummary(todayRecords, yesterdayRecords), [todayRecords, yesterdayRecords]);
  const chartData = useMemo(() => computeRollingAverage(todayRecords), [todayRecords]);
  const hourlyData = useMemo(() => computeHourlyData(todayRecords), [todayRecords]);

  const latestRecord = todayRecords.length > 0 ? todayRecords[todayRecords.length - 1] : null;

  const handleExport = () => {
    const csv = generateCSV(todayRecords);
    downloadCSV(csv, `noise-report-${today}.csv`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Connecting to sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <Volume2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Noise Monitor</h1>
              <p className="text-xs text-muted-foreground">Industrial Safety Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {summary.dangerCount > 0 && (
              <div className="badge-danger" title={`${summary.dangerCount} danger incidents today`}>
                {summary.dangerCount}
              </div>
            )}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Danger Alert Banner */}
      {newDanger && (
        <div className="border-b bg-status-danger/10 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-status-danger">
              <AlertTriangle className="h-4 w-4" />
              New DANGER level detected!
            </div>
            <button onClick={clearDangerAlert} className="text-xs text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status */}
          <StatusCard
            status={latestRecord?.status || "NORMAL"}
            currentDb={latestRecord?.avg_db || 0}
          />

          {/* Peak */}
          <SummaryCard
            title="Peak Noise Today"
            value={`${summary.peakDb} dB`}
            subtitle={`at ${summary.peakTime}`}
            icon={<BarChart3 className="h-5 w-5" />}
            accent
          />

          {/* Danger Minutes */}
          <SummaryCard
            title="Danger Exposure"
            value={`${summary.dangerMinutes} min`}
            subtitle={`${summary.dangerCount} incidents`}
            icon={<Clock className="h-5 w-5" />}
          />

          {/* Trend */}
          <SummaryCard
            title="vs Yesterday"
            value={
              summary.trendPercent !== null
                ? `${summary.trendPercent > 0 ? "+" : ""}${summary.trendPercent}%`
                : "N/A"
            }
            subtitle={
              summary.trendPercent !== null
                ? summary.trendPercent > 0 ? "increase" : "decrease"
                : "No data"
            }
            icon={
              summary.trendPercent !== null && summary.trendPercent > 0
                ? <TrendingUp className="h-5 w-5" />
                : <TrendingDown className="h-5 w-5" />
            }
          />
        </div>

        {/* Charts Row */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <LineChartComponent data={chartData} />
          <SafetyScoreGauge score={summary.safetyScore} />
        </div>

        {/* Distribution + Heatmap */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PieChartComponent
            normalCount={summary.normalCount}
            warningCount={summary.warningCount}
            dangerCount={summary.dangerCount}
          />
          <HeatmapComponent allRecords={allRecords} />
        </div>

        {/* Hourly */}
        <div className="mt-4">
          <HourlyChartComponent data={hourlyData} />
        </div>

        {/* Daily Summary */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SummaryCard title="Avg Noise Today" value={`${summary.averageNoise} dB`} icon={<Volume2 className="h-5 w-5" />} />
          <SummaryCard title="Total Records" value={summary.totalRecords} icon={<Activity className="h-5 w-5" />} />
          <SummaryCard
            title="Safety Score"
            value={`${summary.safetyScore}/100`}
            subtitle={summary.safetyScore >= 80 ? "Good" : summary.safetyScore >= 50 ? "Fair" : "Poor"}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>

        {/* Incident Table */}
        <div className="mt-4">
          <IncidentTable records={todayRecords} />
        </div>
      </main>
    </div>
  );
};

export default Index;
