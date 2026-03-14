import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { formatTimestamp } from "@/utils/analytics";

interface AlignmentChartProps {
  data: Array<{ timestamp: number; smoothedDiff: number; alignmentDiff: number }>;
  threshold?: number;
}

const AlignmentChart = ({ data, threshold = 180 }: AlignmentChartProps) => (
  <div className="card-surface p-4 h-full">
    <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">
      Alignment Trend (Moving Avg)
    </h3>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 20%)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => formatTimestamp(v)}
            stroke="hsl(215 16% 47%)"
            fontSize={10}
            fontFamily="JetBrains Mono"
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            stroke="hsl(215 16% 47%)"
            fontSize={11}
            fontFamily="JetBrains Mono"
            tickFormatter={(val) => `${val.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222 47% 11%)",
              border: "1px solid hsl(217 20% 25%)",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
            }}
            labelFormatter={(v) => formatTimestamp(v as number)}
            formatter={(value: number) => [`${value.toFixed(2)} mm`, "Alignment"]}
          />
          <ReferenceLine
            y={threshold}
            stroke="hsl(0 84% 60%)"
            strokeDasharray="5 5"
            label={{ position: "right", value: "LIMIT", fill: "hsl(0 84% 60%)", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="smoothedDiff"
            stroke="hsl(217 91% 60%)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AlignmentChart;
