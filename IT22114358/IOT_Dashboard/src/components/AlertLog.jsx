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
        No alerts recorded - All readings within safe parameters
      </div>
    );
  }

  return (
    <div className="alert-log">
      {alerts.map((alert, index) => {
        const level = (alert['Level'] || '').toLowerCase();
        const gasVal = alert['Gas Value'] || 0;
        const ppm = parseFloat(alert['PPM']) || 0;
        const time = alert['time'] || '--:--:--';
        const isLive = !!alert.timestamp;

        return (
          <div key={index} className={`alert-entry ${level}-entry`}>
            <span className="alert-time">{time}</span>
            {isLive && <span className="live-dot"></span>}
            <span className={`alert-level ${level}`}>{level.toUpperCase()}</span>
            <span className="alert-message">
              Gas: {gasVal} | PPM: {ppm.toFixed(2)}
              {level === 'danger' ? ' | Fan: ON | Buzzer: ON' : ' | Buzzer: BEEP'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AlertLog;
