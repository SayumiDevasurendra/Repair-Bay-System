function GasGauge({ data }) {
  if (!data) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Waiting for data...</span>
      </div>
    );
  }

  const rawValue = data['Gas Value'] || 0;
  const maxValue = 4095;
  const level = (data['Level'] || 'SAFE').toLowerCase();

  const cx = 100;
  const cy = 95;
  const r = 75;

  // Arc spans from -225deg to -315deg (left to right, 270 degree sweep)
  const startDeg = 225;
  const endDeg = -45;
  const sweepDeg = 270;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPoint = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg)),
  });

  // Background arc (full sweep)
  const bgStart = arcPoint(startDeg);
  const bgEnd = arcPoint(endDeg);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  // Colored zone arcs
  const zoneDeg = (val) => startDeg - (val / maxValue) * sweepDeg;

  const zones = [
    { from: 0, to: 2000, color: '#22c55e' },       // safe
    { from: 2000, to: 2500, color: '#f59e0b' },     // warning
    { from: 2500, to: maxValue, color: '#ef4444' },  // danger
  ];

  const makeArc = (fromVal, toVal) => {
    const d1 = zoneDeg(fromVal);
    const d2 = zoneDeg(toVal);
    const p1 = arcPoint(d1);
    const p2 = arcPoint(d2);
    const sweep = d1 - d2;
    const large = sweep > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  // Needle angle
  const needleDeg = zoneDeg(Math.min(rawValue, maxValue));
  const needleLen = r - 10;
  const needleTip = {
    x: cx + needleLen * Math.cos(toRad(needleDeg)),
    y: cy - needleLen * Math.sin(toRad(needleDeg)),
  };
  // Needle base (small triangle for thickness)
  const baseOffset = 4;
  const perpDeg = needleDeg + 90;
  const baseL = {
    x: cx + baseOffset * Math.cos(toRad(perpDeg)),
    y: cy - baseOffset * Math.sin(toRad(perpDeg)),
  };
  const baseR = {
    x: cx - baseOffset * Math.cos(toRad(perpDeg)),
    y: cy + baseOffset * Math.sin(toRad(perpDeg)),
  };

  const colorMap = {
    safe: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  // Tick marks
  const ticks = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000];
  const tickMarks = ticks.map((val) => {
    const deg = zoneDeg(val);
    const outerR = r + 2;
    const innerR = r - 8;
    const outer = { x: cx + outerR * Math.cos(toRad(deg)), y: cy - outerR * Math.sin(toRad(deg)) };
    const inner = { x: cx + innerR * Math.cos(toRad(deg)), y: cy - innerR * Math.sin(toRad(deg)) };
    const labelR = r - 18;
    const label = { x: cx + labelR * Math.cos(toRad(deg)), y: cy - labelR * Math.sin(toRad(deg)) };
    return { val, outer, inner, label };
  });

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="5 5 190 130">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

        {/* Colored zone arcs */}
        {zones.map((z, i) => (
          <path key={i} d={makeArc(z.from, z.to)} fill="none" stroke={z.color} strokeWidth="16" strokeLinecap="butt" opacity={0.25} />
        ))}

        {/* Active fill arc (from 0 to current value) */}
        {rawValue > 0 && (
          <path d={makeArc(0, Math.min(rawValue, maxValue))} fill="none" stroke={colorMap[level]} strokeWidth="16" strokeLinecap="round" />
        )}

        {/* Tick marks */}
        {tickMarks.map((t, i) => (
          <g key={i}>
            <line x1={t.outer.x} y1={t.outer.y} x2={t.inner.x} y2={t.inner.y} stroke="#475569" strokeWidth="1.5" />
            <text x={t.label.x} y={t.label.y} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="7" fontFamily="Inter, sans-serif">
              {t.val >= 1000 ? `${t.val / 1000}k` : t.val}
            </text>
          </g>
        ))}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`}
          fill={colorMap[level]}
          style={{ transition: 'all 0.5s ease-out' }}
        />

        {/* Center cap */}
        <circle cx={cx} cy={cy} r="6" fill="#1a2035" stroke={colorMap[level]} strokeWidth="2" />

        {/* Needle glow */}
        <circle cx={cx} cy={cy} r="3" fill={colorMap[level]} opacity="0.6" />
      </svg>

      <div className={`gauge-value ${level}`}>{rawValue}</div>
      <div className="gauge-label">Raw ADC Value (0 - 4095)</div>
      <div className="gauge-thresholds">
        <span><span className="threshold-dot safe"></span> &lt;2000 Safe</span>
        <span><span className="threshold-dot warning"></span> 2000-2500 Warning</span>
        <span><span className="threshold-dot danger"></span> &gt;2500 Danger</span>
      </div>
    </div>
  );
}

export default GasGauge;
