function AlertLog({ history, firebaseHistory }) {
  // Combine live MQTT alerts + Firebase historical alerts
  const allEntries = [...(firebaseHistory || []), ...(history || [])];

  // Filter only warning/danger entries
  const alerts = allEntries
    .filter((entry) => {
      const level = (entry['Level'] || '').toUpperCase();
      return level === 'WARNING' || level === 'DANGER';
    })
    .reverse()
    .slice(0, 50);

  if (alerts.length === 0) {
    return (
      <div className="no-alerts">
        No alerts recorded — All readings within safe levels
      </div>
    );
  }

  // Format time to show only HH:MM:SS for readability
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '--:--:--') return '--:--:--';
    // Extract time portion if full datetime string
    const parts = timeStr.split(' ');
    return parts.length > 1 ? parts[1] : timeStr;
  };

  // Format date to show only date portion
  const formatDate = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    return parts.length > 1 ? parts[0] : '';
  };

  return (
    <div className="alert-log">
      {alerts.map((alert, index) => {
        const level = (alert['Level'] || '').toLowerCase();
        const ppm = parseFloat(alert['PPM']) || 0;
        const time = alert['time'] || '--:--:--';

        // User-friendly message
        const message = level === 'danger'
          ? `High gas detected (${ppm.toFixed(1)} PPM) — Fan activated, buzzer sounding`
          : `Elevated gas detected (${ppm.toFixed(1)} PPM) — Buzzer alert active`;

        return (
          <div key={index} className={`alert-entry ${level}-entry`}>
            <span className="alert-time" title={formatDate(time)}>{formatTime(time)}</span>
            <span className={`alert-level ${level}`}>{level.toUpperCase()}</span>
            <span className="alert-message">{message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default AlertLog;
