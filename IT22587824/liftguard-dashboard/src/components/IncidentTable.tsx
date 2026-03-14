import type { LiftRecord } from "@/services/firebase";
import { formatTimestamp, formatDate, mmToCm } from "@/utils/analytics";

interface IncidentTableProps {
  records: LiftRecord[];
}

const IncidentTable = ({ records }: IncidentTableProps) => {
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="card-surface p-4 overflow-hidden">
      <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">
        Incident History
      </h3>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
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
            {sorted.slice(0, 100).map((r) => (
              <tr
                key={r.id}
                className={`border-b border-border/30 ${
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
      </div>
    </div>
  );
};

export default IncidentTable;
