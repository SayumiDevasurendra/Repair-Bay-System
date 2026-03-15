import { useState } from "react";
import type { LiftRecord } from "@/services/firebase";
import { formatTimestamp, formatDate, mmToCm } from "@/utils/analytics";

type Tab = "all" | "safe" | "unsafe";

interface IncidentTableProps {
  records: LiftRecord[];
}

const TAB_CONFIG: { id: Tab; label: string; color: string; activeStyle: string }[] = [
  {
    id: "all",
    label: "All Incidents",
    color: "text-muted-foreground",
    activeStyle: "border-b-2 border-primary text-foreground",
  },
  {
    id: "safe",
    label: "Safe",
    color: "text-muted-foreground",
    activeStyle: "border-b-2 border-status-safe text-status-safe",
  },
  {
    id: "unsafe",
    label: "Unsafe",
    color: "text-muted-foreground",
    activeStyle: "border-b-2 border-status-unsafe text-status-unsafe",
  },
];

const IncidentTable = ({ records }: IncidentTableProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  const filtered =
    activeTab === "all"
      ? sorted
      : sorted.filter((r) => r.status === activeTab.toUpperCase());

  const allCount    = sorted.length;
  const safeCount   = sorted.filter((r) => r.status === "SAFE").length;
  const unsafeCount = sorted.filter((r) => r.status === "UNSAFE").length;

  const counts: Record<Tab, number> = { all: allCount, safe: safeCount, unsafe: unsafeCount };

  return (
    <div className="card-surface p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          Incident History
        </h3>
        <span className="text-xs text-muted-foreground">
          Showing {Math.min(filtered.length, 100)} of {filtered.length}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/40">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors pb-[9px] focus:outline-none ${
              activeTab === tab.id ? tab.activeStyle : `${tab.color} hover:text-foreground`
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === tab.id
                  ? tab.id === "safe"
                    ? "bg-status-safe/20 text-status-safe"
                    : tab.id === "unsafe"
                    ? "bg-status-unsafe/20 text-status-unsafe"
                    : "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <span className="text-3xl mb-2">
              {activeTab === "safe" ? "✅" : activeTab === "unsafe" ? "⚠️" : "📋"}
            </span>
            <p className="text-sm">No {activeTab} incidents found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left p-2 font-medium">Date</th>
                <th className="text-left p-2 font-medium">Time</th>
                <th className="text-right p-2 font-medium">Left (cm)</th>
                <th className="text-right p-2 font-medium">Right (cm)</th>
                <th className="text-right p-2 font-medium">Diff (cm)</th>
                <th className="text-right p-2 font-medium">Tilt X</th>
                <th className="text-right p-2 font-medium">Tilt Y</th>
                <th className="text-center p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-border/30 transition-colors hover:bg-muted/40 ${
                    r.status === "UNSAFE" ? "bg-status-unsafe/5" : ""
                  }`}
                >
                  <td className="p-2 font-mono text-xs tabular-nums text-foreground">{formatDate(r.timestamp)}</td>
                  <td className="p-2 font-mono text-xs tabular-nums text-foreground">{formatTimestamp(r.timestamp)}</td>
                  <td className="p-2 text-right font-mono text-xs tabular-nums text-foreground">{mmToCm(r.leftDistance).toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs tabular-nums text-foreground">{mmToCm(r.rightDistance).toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs tabular-nums text-foreground">{mmToCm(r.alignmentDiff).toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs tabular-nums text-foreground">{r.tiltX.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs tabular-nums text-foreground">{r.tiltY.toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "SAFE"
                          ? "bg-status-safe/20 status-safe-text"
                          : "bg-status-unsafe/20 status-unsafe-text"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IncidentTable;
