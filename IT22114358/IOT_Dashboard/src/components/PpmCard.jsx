function PpmCard({ data }) {
  if (!data) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Waiting for data...</span>
      </div>
    );
  }

  const ppm = parseFloat(data['PPM']) || 0;
  const voltage = parseFloat(data['Voltage']) || 0;
  const level = (data['Level'] || 'SAFE').toLowerCase();

  // PPM bar width (scale 0-30 PPM range for visual)
  const barPercent = Math.min((ppm / 30) * 100, 100);

  // PPM-based level for display (thresholds: 10 warning, 18 danger)
  const ppmLevel = ppm >= 18 ? 'danger' : ppm >= 10 ? 'warning' : 'safe';

  return (
    <div className="ppm-container">
      <div className="ppm-main">
        <span className={`ppm-value ${ppmLevel}`}>
          {ppm.toFixed(2)}
          <span className="ppm-unit">PPM</span>
        </span>
        <div className="ppm-voltage">Sensor Voltage: {voltage.toFixed(2)}V</div>
      </div>
      <div className="ppm-bar">
        <div
          className={`ppm-bar-fill ${ppmLevel}`}
          style={{ width: `${Math.max(barPercent, 2)}%` }}
        ></div>
      </div>
      <div className="ppm-levels">
        <div className={`ppm-level-item safe ${ppmLevel === 'safe' ? 'active' : ''}`}>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>&lt;10</div>
          <div>SAFE</div>
        </div>
        <div className={`ppm-level-item warning ${ppmLevel === 'warning' ? 'active' : ''}`}>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>10-18</div>
          <div>WARNING</div>
        </div>
        <div className={`ppm-level-item danger ${ppmLevel === 'danger' ? 'active' : ''}`}>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>&gt;18</div>
          <div>DANGER</div>
        </div>
      </div>
    </div>
  );
}

export default PpmCard;
