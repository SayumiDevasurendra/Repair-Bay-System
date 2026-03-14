function TodaySummary({ liveHistory, firebaseHistory }) {
  const allEntries = [...(firebaseHistory || []), ...(liveHistory || [])];

  // Filter today's entries
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const todayEntries = allEntries.filter((e) => {
    const t = e['time'] || '';
    return t.startsWith(today);
  });

  // Use all entries as fallback if no today filter matches (ESP32 uses Sri Lanka time)
  const entries = todayEntries.length > 0 ? todayEntries : allEntries;

  // Total alerts today
  const alertCount = entries.filter((e) => {
    const level = (e['Level'] || '').toUpperCase();
    return level === 'WARNING' || level === 'DANGER';
  }).length;

  const warningCount = entries.filter((e) => (e['Level'] || '').toUpperCase() === 'WARNING').length;
  const dangerCount = entries.filter((e) => (e['Level'] || '').toUpperCase() === 'DANGER').length;

  // Peak gas reading
  const peakGas = entries.reduce((max, e) => {
    const val = parseFloat(e['PPM']) || 0;
    return val > max ? val : max;
  }, 0);

  // Peak PPM level label
  const peakLevel = peakGas >= 18 ? 'danger' : peakGas >= 10 ? 'warning' : 'safe';

  // Total readings
  const totalReadings = entries.length;

  // Safe reading percentage
  const safeCount = entries.filter((e) => (e['Level'] || '').toUpperCase() === 'SAFE').length;
  const safePercent = totalReadings > 0 ? Math.round((safeCount / totalReadings) * 100) : 100;

  // Time since last alert
  const alertEntries = entries
    .filter((e) => {
      const level = (e['Level'] || '').toUpperCase();
      return level === 'WARNING' || level === 'DANGER';
    })
    .sort((a, b) => (a['time'] || '').localeCompare(b['time'] || ''));

  let lastAlertText = 'No alerts';
  if (alertEntries.length > 0) {
    const lastAlertTime = alertEntries[alertEntries.length - 1]['time'];
    if (lastAlertTime) {
      const parts = lastAlertTime.split(' ');
      lastAlertText = parts.length > 1 ? parts[1] : lastAlertTime;
    }
  }

  const stats = [
    {
      label: 'Total Alerts Today',
      value: alertCount,
      sub: warningCount > 0 || dangerCount > 0
        ? `${warningCount} warning, ${dangerCount} danger`
        : 'All clear',
      color: alertCount === 0 ? 'var(--safe-green)' : alertCount <= 5 ? 'var(--warning-amber)' : 'var(--danger-red)',
    },
    {
      label: 'Peak Gas (PPM)',
      value: peakGas.toFixed(1),
      sub: peakLevel === 'safe' ? 'Within safe range' : peakLevel === 'warning' ? 'Reached warning' : 'Reached danger',
      color: peakLevel === 'safe' ? 'var(--safe-green)' : peakLevel === 'warning' ? 'var(--warning-amber)' : 'var(--danger-red)',
    },
    {
      label: 'Safe Readings',
      value: `${safePercent}%`,
      sub: `${safeCount} of ${totalReadings} readings`,
      color: safePercent >= 95 ? 'var(--safe-green)' : safePercent >= 80 ? 'var(--warning-amber)' : 'var(--danger-red)',
    },
    {
      label: 'Last Alert At',
      value: lastAlertText,
      sub: alertCount === 0 ? 'No alerts recorded' : `${alertCount} alerts total today`,
      color: alertCount === 0 ? 'var(--safe-green)' : 'var(--warning-amber)',
    },
  ];

  return (
    <div className="summary-bar">
      {stats.map((stat, i) => (
        <div key={i} className="summary-stat">
          <span className="summary-label">{stat.label}</span>
          <span className="summary-value" style={{ color: stat.color }}>{stat.value}</span>
          <span className="summary-sub">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
}

export default TodaySummary;
