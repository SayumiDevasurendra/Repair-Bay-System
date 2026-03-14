import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function TrendChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Collecting data points...</span>
      </div>
    );
  }

  const chartData = history.map((entry, index) => ({
    name: entry.time || `#${index + 1}`,
    gasValue: entry['Gas Value'] || 0,
    ppm: parseFloat(entry['PPM']) || 0,
    average: parseFloat(entry['Average']) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a2035',
          border: '1px solid #2a3352',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '12px',
        }}>
          <p style={{ color: '#94a3b8', marginBottom: '6px' }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontWeight: 600 }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickFormatter={(v) => {
              if (typeof v === 'string' && v.includes(':')) {
                return v.split(' ').pop();
              }
              return v;
            }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={2000} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'WARNING', fill: '#f59e0b', fontSize: 10 }} />
          <ReferenceLine y={2500} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'DANGER', fill: '#ef4444', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="gasValue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Gas Value"
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#06b6d4"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Average"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
