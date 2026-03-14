interface SafetyScoreProps {
  score: number;
}

const SafetyScore = ({ score }: SafetyScoreProps) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "hsl(142 71% 45%)";
    if (score >= 50) return "hsl(45 93% 47%)";
    return "hsl(0 84% 60%)";
  };

  const getLabel = () => {
    if (score >= 80) return "SAFE";
    if (score >= 50) return "WARNING";
    return "CRITICAL";
  };

  return (
    <div className="card-surface p-4 flex flex-col items-center justify-center h-full">
      <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">Safety Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(217 20% 20%)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono tabular-nums text-foreground">{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{getLabel()}</span>
        </div>
      </div>
    </div>
  );
};

export default SafetyScore;
