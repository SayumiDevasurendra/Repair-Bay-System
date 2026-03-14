interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon?: React.ReactNode;
}

const MetricCard = ({ label, value, unit, icon }: MetricCardProps) => (
  <div className="card-surface p-4 animate-fade-in">
    <div className="flex items-center justify-between mb-1">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      {icon && <span className="text-muted-foreground">{icon}</span>}
    </div>
    <div className="flex items-baseline gap-1.5 mt-2">
      <span className="text-2xl font-semibold text-foreground font-mono tabular-nums">
        {typeof value === "number" ? value.toFixed(2) : value}
      </span>
      <span className="text-muted-foreground text-sm">{unit}</span>
    </div>
  </div>
);

export default MetricCard;
