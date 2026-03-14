import { type ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accent?: boolean;
}

const SummaryCard = ({ title, value, subtitle, icon, accent }: SummaryCardProps) => (
  <div className="dashboard-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${accent ? "text-accent" : ""}`}>{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="rounded-lg bg-secondary p-2.5 text-muted-foreground">{icon}</div>
    </div>
  </div>
);

export default SummaryCard;
