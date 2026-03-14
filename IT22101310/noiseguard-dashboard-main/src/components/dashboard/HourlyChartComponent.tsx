import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HourlyData } from "@/lib/types";

interface HourlyChartProps {
  data: HourlyData[];
}

const HourlyChartComponent = ({ data }: HourlyChartProps) => {
  const maxHour = data.length > 0 ? data.reduce((max, d) => (d.avgDb > max.avgDb ? d : max), data[0]) : null;

  return (
    <div className="dashboard-card col-span-full lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Hourly Noise Analysis
        </h3>
        {maxHour && (
          <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
            Noisiest: {maxHour.label} ({maxHour.avgDb} dB)
          </span>
        )}
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(215, 14%, 46%)" tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 46%)" tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(215, 20%, 90%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} dB`, "Avg Noise"]}
            />
            <Bar dataKey="avgDb" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChartComponent;
