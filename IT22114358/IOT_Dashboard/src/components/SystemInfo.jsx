function SystemInfo({ data, mqttStatus, firebaseStatus }) {
  const level = data ? (data['Level'] || 'SAFE').toUpperCase() : '--';
  const fanOn = level === 'DANGER';
  const sensorOnline = mqttStatus === 'connected';
  const lastTime = data?.time || '--';

  return (
    <div className="safety-guide">
      {/* Live Status Row */}
      <div className="safety-status-row">
        <div className="safety-status-item">
          <span className={`status-dot ${sensorOnline ? 'online' : 'offline'}`}></span>
          <div>
            <span className="status-title">Gas Sensor</span>
            <span className="status-detail">{sensorOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="safety-status-item">
          <span className={`status-dot ${fanOn ? 'fan-active' : 'fan-idle'}`}></span>
          <div>
            <span className="status-title">Exhaust Fan</span>
            <span className="status-detail">{fanOn ? 'Running' : 'Standby'}</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="safety-last-update">
        Last checked: <strong>{lastTime}</strong>
      </div>

      {/* Safety Level Guide */}
      <div className="safety-levels-guide">
        <h4 className="safety-section-title">What Each Level Means</h4>
        <div className={`safety-level-card safe ${level === 'SAFE' ? 'active-level' : ''}`}>
          <div className="level-header">
            <span className="level-dot safe-dot"></span>
            <strong>SAFE</strong>
          </div>
          <p>Air quality is normal. Continue work as usual.</p>
        </div>
        <div className={`safety-level-card warning ${level === 'WARNING' ? 'active-level' : ''}`}>
          <div className="level-header">
            <span className="level-dot warning-dot"></span>
            <strong>WARNING</strong>
          </div>
          <p>Gas detected above normal. Open doors and windows. Stay alert for changes.</p>
        </div>
        <div className={`safety-level-card danger ${level === 'DANGER' ? 'active-level' : ''}`}>
          <div className="level-header">
            <span className="level-dot danger-dot"></span>
            <strong>DANGER</strong>
          </div>
          <p>High gas level! Exhaust fan activates automatically. Evacuate the bay. Do not use ignition sources.</p>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="safety-emergency">
        <h4 className="safety-section-title">Emergency Actions</h4>
        <ul className="emergency-list">
          <li>Turn off all engines and ignition sources</li>
          <li>Evacuate the repair bay immediately</li>
          <li>Call emergency services: <strong>119</strong></li>
          <li>Do not re-enter until the system shows SAFE</li>
        </ul>
      </div>
    </div>
  );
}

export default SystemInfo;
