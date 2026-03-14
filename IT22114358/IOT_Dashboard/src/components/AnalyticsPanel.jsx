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

  // User-friendly trend descriptions
  const trendLabel = trend === 'RISING' ? 'Increasing' : trend === 'FALLING' ? 'Decreasing' : 'Stable';
  const trendIcon = trend === 'RISING' ? ' ^' : trend === 'FALLING' ? ' v' : ' -';

  // Stability description based on deviation
  const stabilityLabel = deviation > 300 ? 'Unstable' : deviation > 100 ? 'Slightly Fluctuating' : 'Stable';
  const stabilityColor = deviation > 300 ? '#ef4444' : deviation > 100 ? '#f59e0b' : '#22c55e';

  return (
    <div className="analytics-grid">
      <div className="analytics-item">
        <span className="analytics-label">Average Gas Reading</span>
        <span className="analytics-value">{average.toFixed(0)}</span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Reading Stability</span>
        <span className="analytics-value" style={{ color: stabilityColor, fontSize: '13px' }}>
          {stabilityLabel}
        </span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Gas Level Trend</span>
        <span className={`trend-badge ${trendClass}`}>{trendLabel}{trendIcon}</span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Sudden Spike Detection</span>
        {isSpike ? (
          <span className="spike-alert">SPIKE DETECTED</span>
        ) : (
          <span className="analytics-value" style={{ color: '#22c55e', fontSize: '12px' }}>No Spikes</span>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPanel;
