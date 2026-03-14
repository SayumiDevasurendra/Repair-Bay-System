import { NoiseStatus } from "@/lib/types";
import { Activity, AlertTriangle, Shield } from "lucide-react";

interface StatusCardProps {
  status: NoiseStatus;
  currentDb: number;
}

const config = {
  NORMAL: { icon: Shield, label: "Normal", className: "status-normal" },
  WARNING: { icon: AlertTriangle, label: "Warning", className: "status-warning" },
  DANGER: { icon: Activity, label: "Danger", className: "status-danger" },
};

const StatusCard = ({ status, currentDb }: StatusCardProps) => {
  const { icon: Icon, label, className } = config[status] || config.NORMAL;

  return (
    <div className={`dashboard-card flex items-center gap-4 border-l-4 ${className}`}>
      <div className={`rounded-xl p-3 ${className}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Current Status</p>
        <p className="text-2xl font-bold">{label}</p>
        <p className="font-mono text-lg font-semibold">{currentDb} dB</p>
      </div>
    </div>
  );
};

export default StatusCard;
