type AccentColor = "blue" | "cyan" | "purple" | "amber" | "teal" | "rose";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon?: React.ReactNode;
  color?: AccentColor;
}

const borderClass: Record<AccentColor, string> = {
  blue:   "card-accent-blue",
  cyan:   "card-accent-cyan",
  purple: "card-accent-purple",
  amber:  "card-accent-amber",
  teal:   "card-accent-teal",
  rose:   "card-accent-rose",
};

const iconBgClass: Record<AccentColor, string> = {
  blue:   "icon-bg-blue",
  cyan:   "icon-bg-cyan",
  purple: "icon-bg-purple",
  amber:  "icon-bg-amber",
  teal:   "icon-bg-teal",
  rose:   "icon-bg-rose",
};

const valueClass: Record<AccentColor, string> = {
  blue:   "text-primary",
  cyan:   "text-accent-cyan",
  purple: "text-accent-purple",
  amber:  "text-accent-amber",
  teal:   "text-accent-teal",
  rose:   "text-accent-rose",
};

const MetricCard = ({ label, value, unit, icon, color }: MetricCardProps) => (
  <div className={`card-surface p-4 animate-fade-in ${color ? borderClass[color] : ""}`}>
    <div className="flex items-center justify-between mb-1">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      {icon && (
        <span className={`p-1.5 rounded-md ${color ? iconBgClass[color] : "text-muted-foreground"}`}>
          {icon}
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-1.5 mt-2">
      <span className={`text-2xl font-semibold font-mono tabular-nums ${color ? valueClass[color] : "text-foreground"}`}>
        {typeof value === "number" ? value.toFixed(2) : value}
      </span>
      <span className="text-muted-foreground text-sm">{unit}</span>
    </div>
  </div>
);

export default MetricCard;
