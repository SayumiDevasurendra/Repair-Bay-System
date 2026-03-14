import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface LineChartProps {
  data: { time: string; avg_db: number; raw_db: number }[];
}

const LineChartComponent = ({ data }: LineChartProps) => {
  // Show last 60 records for readability
  const displayData = data.slice(-60);

  return (
    <div className="dashboard-card col-span-full lg:col-span-2">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Real-Time Noise Level
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 46%)" tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 46%)" tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(215, 20%, 90%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `${value} dB`,
                name === "avg_db" ? "Moving Avg" : "Raw",
              ]}
            />
            <Area type="monotone" dataKey="avg_db" stroke="hsl(24, 95%, 53%)" fill="url(#noiseGradient)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="raw_db" stroke="hsl(215, 14%, 46%)" strokeWidth={1} dot={false} strokeDasharray="3 3" opacity={0.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;
