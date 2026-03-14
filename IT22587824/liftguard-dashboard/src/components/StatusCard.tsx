import type { LiftRecord } from "@/services/firebase";
import { formatTimestamp } from "@/utils/analytics";
import { Shield, ShieldAlert } from "lucide-react";

interface StatusCardProps {
  record: LiftRecord | null;
}

const StatusCard = ({ record }: StatusCardProps) => {
  if (!record) {
    return (
      <div className="card-surface p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Awaiting data...</p>
      </div>
    );
  }

  const isSafe = record.status === "SAFE";

  return (
    <div
      className={`card-surface p-6 border-l-4 animate-fade-in ${
        isSafe ? "border-l-status-safe" : "border-l-status-unsafe animate-pulse-unsafe"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isSafe ? (
          <Shield className="w-8 h-8 status-safe-text" />
        ) : (
          <ShieldAlert className="w-8 h-8 status-unsafe-text" />
        )}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">System Status</p>
          <h2 className={`text-xl font-bold font-mono ${isSafe ? "status-safe-text" : "status-unsafe-text"}`}>
            {isSafe ? "OPERATIONAL" : "CRITICAL_ALIGNMENT"}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Alignment Diff</p>
          <p className="font-mono tabular-nums text-foreground">{record.alignmentDiff.toFixed(2)} mm</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Tilt X / Y</p>
          <p className="font-mono tabular-nums text-foreground">
            {record.tiltX.toFixed(2)}° / {record.tiltY.toFixed(2)}°
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Last Update</p>
          <p className="font-mono tabular-nums text-foreground text-xs">{formatTimestamp(record.timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
