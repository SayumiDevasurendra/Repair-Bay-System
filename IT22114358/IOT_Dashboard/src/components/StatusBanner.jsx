function StatusBanner({ data }) {
  if (!data) {
    return (
      <div className="status-banner offline">
        <span className="status-icon">--</span>
        <span>Waiting for sensor data...</span>
      </div>
    );
  }

  const level = (data['Level'] || 'SAFE').toUpperCase();

  const config = {
    SAFE: { className: 'safe', icon: '[OK]', text: 'AIR QUALITY NORMAL - ALL SYSTEMS SAFE' },
    WARNING: { className: 'warning', icon: '[!!]', text: 'ELEVATED GAS LEVELS DETECTED - CAUTION ADVISED' },
    DANGER: { className: 'danger', icon: '[XX]', text: 'DANGER: HIGH GAS CONCENTRATION - EXHAUST FAN ACTIVATED' },
  };

  const c = config[level] || config.SAFE;

  return (
    <div className={`status-banner ${c.className}`}>
      <span className="status-icon">{c.icon}</span>
      <span>{c.text}</span>
    </div>
  );
}

export default StatusBanner;
