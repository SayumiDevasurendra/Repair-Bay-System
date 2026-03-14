function ShiftSafety({ liveHistory, firebaseHistory }) {
  const allEntries = [...(firebaseHistory || []), ...(liveHistory || [])];

  const total = allEntries.length;
  const safeCount = allEntries.filter((e) => (e['Level'] || '').toUpperCase() === 'SAFE').length;
  const warningCount = allEntries.filter((e) => (e['Level'] || '').toUpperCase() === 'WARNING').length;
  const dangerCount = allEntries.filter((e) => (e['Level'] || '').toUpperCase() === 'DANGER').length;

  // Safety score: 100 base, -1 per warning, -3 per danger
  const rawScore = total > 0 ? Math.max(0, Math.round(100 - (warningCount * 1) - (dangerCount * 3))) : 100;
  const score = Math.min(100, rawScore);

  // Grade
  const grade = score >= 95 ? 'A' : score >= 85 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
  const gradeColor = score >= 95 ? 'var(--safe-green)' : score >= 85 ? '#4ade80' : score >= 70 ? 'var(--warning-amber)' : score >= 50 ? '#f97316' : 'var(--danger-red)';
  const gradeLabel = score >= 95 ? 'Excellent' : score >= 85 ? 'Good' : score >= 70 ? 'Fair' : score >= 50 ? 'Needs Attention' : 'Poor';

  // Percentages for the bar
  const safePct = total > 0 ? (safeCount / total) * 100 : 100;
  const warnPct = total > 0 ? (warningCount / total) * 100 : 0;
  const dangerPct = total > 0 ? (dangerCount / total) * 100 : 0;

  // Longest safe streak
  let maxStreak = 0;
  let currentStreak = 0;
  for (const entry of allEntries) {
    if ((entry['Level'] || '').toUpperCase() === 'SAFE') {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return (
    <div className="shift-safety">
      <div className="shift-score-section">
        <div className="shift-score-circle" style={{ borderColor: gradeColor }}>
          <span className="shift-grade" style={{ color: gradeColor }}>{grade}</span>
          <span className="shift-score-num">{score}/100</span>
        </div>
        <div className="shift-score-info">
          <span className="shift-score-label" style={{ color: gradeColor }}>{gradeLabel}</span>
          <span className="shift-score-desc">
            Based on {total} readings this session
          </span>
        </div>
      </div>

      <div className="shift-breakdown">
        <div className="shift-bar">
          {safePct > 0 && <div className="shift-bar-seg safe" style={{ width: `${safePct}%` }}></div>}
          {warnPct > 0 && <div className="shift-bar-seg warning" style={{ width: `${warnPct}%` }}></div>}
          {dangerPct > 0 && <div className="shift-bar-seg danger" style={{ width: `${dangerPct}%` }}></div>}
        </div>
        <div className="shift-legend">
          <div className="shift-legend-item">
            <span className="shift-legend-dot" style={{ background: 'var(--safe-green)' }}></span>
            <span>Safe {safePct.toFixed(0)}%</span>
            <span className="shift-legend-count">({safeCount})</span>
          </div>
          <div className="shift-legend-item">
            <span className="shift-legend-dot" style={{ background: 'var(--warning-amber)' }}></span>
            <span>Warning {warnPct.toFixed(0)}%</span>
            <span className="shift-legend-count">({warningCount})</span>
          </div>
          <div className="shift-legend-item">
            <span className="shift-legend-dot" style={{ background: 'var(--danger-red)' }}></span>
            <span>Danger {dangerPct.toFixed(0)}%</span>
            <span className="shift-legend-count">({dangerCount})</span>
          </div>
          <div className="shift-legend-item">
            <span className="shift-legend-dot" style={{ background: 'var(--accent-blue)' }}></span>
            <span>Best safe streak</span>
            <span className="shift-legend-count">{maxStreak} readings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftSafety;
