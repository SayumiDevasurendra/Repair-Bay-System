function AnalyticsPanel({ data }) {
  if (!data) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Waiting for data...</span>
      </div>
    );
  }

  const average = parseFloat(data['Average']) || 0;
  const deviation = parseFloat(data['Deviation']) || 0;
  const trend = data['Trend'] || 'STABLE';
  const alertType = data['Alert Type'] || 'NONE';
  const isSpike = alertType !== 'NONE';

  const trendClass = trend === 'RISING' ? 'rising' : trend === 'FALLING' ? 'falling' : 'stable';
  const trendArrow = trend === 'RISING' ? ' ^' : trend === 'FALLING' ? ' v' : ' -';

  return (
    <div className="analytics-grid">
      <div className="analytics-item">
        <span className="analytics-label">Rolling Average (10)</span>
        <span className="analytics-value">{average.toFixed(2)}</span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Deviation</span>
        <span className="analytics-value" style={{ color: deviation > 300 ? '#ef4444' : '#f1f5f9' }}>
          {deviation.toFixed(2)}
        </span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Trend Direction</span>
        <span className={`trend-badge ${trendClass}`}>{trend}{trendArrow}</span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Spike Detection</span>
        {isSpike ? (
          <span className="spike-alert">SPIKE DETECTED</span>
        ) : (
          <span className="analytics-value" style={{ color: '#22c55e', fontSize: '12px' }}>Normal</span>
        )}
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Spike Threshold</span>
        <span className="analytics-value" style={{ fontSize: '12px' }}>300 (deviation)</span>
      </div>
    </div>
  );
}

export default AnalyticsPanel;
