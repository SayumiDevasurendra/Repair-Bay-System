import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartComponentProps {
  safeCount: number;
  unsafeCount: number;
}

const COLORS = ["hsl(142 71% 45%)", "hsl(0 84% 60%)"];

const PieChartComponent = ({ safeCount, unsafeCount }: PieChartComponentProps) => {
  const data = [
    { name: "SAFE", value: safeCount },
    { name: "UNSAFE", value: unsafeCount },
  ];
  const total = safeCount + unsafeCount;

  return (
    <div className="card-surface p-4 flex flex-col h-full">
      <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
        Status Distribution
      </h3>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222 47% 11%)",
                border: "1px solid hsl(217 20% 25%)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartComponent;
