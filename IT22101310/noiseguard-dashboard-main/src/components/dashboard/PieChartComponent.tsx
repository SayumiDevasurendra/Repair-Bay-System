import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartProps {
  normalCount: number;
  warningCount: number;
  dangerCount: number;
}

const COLORS = ["hsl(152, 69%, 41%)", "hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)"];

const PieChartComponent = ({ normalCount, warningCount, dangerCount }: PieChartProps) => {
  const total = normalCount + warningCount + dangerCount;
  const data = [
    { name: "Normal", value: normalCount, pct: total ? Math.round((normalCount / total) * 100) : 0 },
    { name: "Warning", value: warningCount, pct: total ? Math.round((warningCount / total) * 100) : 0 },
    { name: "Danger", value: dangerCount, pct: total ? Math.round((dangerCount / total) * 100) : 0 },
  ];

  return (
    <div className="dashboard-card">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Status Distribution
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value} records`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-center gap-4">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-muted-foreground">{d.name} {d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
