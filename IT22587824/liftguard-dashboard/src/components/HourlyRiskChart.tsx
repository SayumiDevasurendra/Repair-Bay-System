import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface HourlyRiskChartProps {
  data: Array<{ hour: string; avg: number; count: number }>;
}

const HourlyRiskChart = ({ data }: HourlyRiskChartProps) => {
  const maxAvg = Math.max(...data.map((d) => d.avg), 1);

  return (
    <div className="card-surface p-4 h-full">
      <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">
        Hourly Risk Analysis
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 20%)" vertical={false} />
            <XAxis dataKey="hour" stroke="hsl(215 16% 47%)" fontSize={9} fontFamily="JetBrains Mono" interval={2} />
            <YAxis stroke="hsl(215 16% 47%)" fontSize={11} fontFamily="JetBrains Mono" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222 47% 11%)",
                border: "1px solid hsl(217 20% 25%)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
              }}
                formatter={(value: number) => [`${value.toFixed(2)} cm`, "Avg Alignment"]}
            />
            <Bar dataKey="avg" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.avg === maxAvg && entry.avg > 0
                      ? "hsl(0 84% 60%)"
                        : entry.avg > 10
                        ? "hsl(45 93% 47%)"
                        : "hsl(217 91% 60%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyRiskChart;
